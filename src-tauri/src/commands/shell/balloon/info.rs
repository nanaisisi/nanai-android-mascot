use super::manifest::balloon_descript_map;
use crate::commands::shell::{open_text_file, resolve_asset_path};
use base64::Engine;
use std::path::{Path, PathBuf};

#[derive(serde::Serialize, Clone)]
pub struct BalloonInfo {
    pub(crate) dir_name: String,
    pub(crate) name: String,
    pub(crate) descript: std::collections::BTreeMap<String, String>,
    pub(crate) thumbnail: Option<String>,
    pub(crate) readme: Option<String>,
}

#[allow(dead_code)]
impl BalloonInfo {
    pub fn dir_name(&self) -> &str {
        &self.dir_name
    }
    pub fn name(&self) -> &str {
        &self.name
    }
    pub fn descript(&self) -> &std::collections::BTreeMap<String, String> {
        &self.descript
    }
    pub fn thumbnail(&self) -> Option<&str> {
        self.thumbnail.as_deref()
    }
    pub fn readme(&self) -> Option<&str> {
        self.readme.as_deref()
    }
}

#[tauri::command]
pub fn scan_balloons(app_handle: tauri::AppHandle) -> Result<Vec<BalloonInfo>, String> {
    let mut balloons = Vec::new();
    let mut search_paths = vec!["assets/balloon".to_string(), "balloon".to_string()];

    if let Ok(app_dir) = app_handle.path().app_data_dir() {
        search_paths.push(
            app_dir
                .join("assets/balloon")
                .to_string_lossy()
                .into_owned(),
        );
        search_paths.push(app_dir.join("balloon").to_string_lossy().into_owned());
    }

    if let Ok(res_dir) = app_handle.path().resource_dir() {
        search_paths.push(
            res_dir
                .join("assets/balloon")
                .to_string_lossy()
                .into_owned(),
        );
        search_paths.push(res_dir.join("balloon").to_string_lossy().into_owned());
    }

    if let Ok(ghosts) = std::fs::read_dir("assets/ghost") {
        for entry in ghosts.flatten() {
            let path = entry.path();
            if path.is_dir() {
                search_paths.push(path.join("balloon").to_string_lossy().into_owned());
                search_paths.push(
                    path.join("ghost")
                        .join("master")
                        .join("balloon")
                        .to_string_lossy()
                        .into_owned(),
                );
            }
        }
    }

    use tauri::Manager;
    let mut scanned_dirs = std::collections::HashSet::new();

    for base_dir in search_paths {
        println!("🔍 [Balloon Scan] 探索ベースディレクトリ: {}", base_dir);
        if let Ok(resolved) = resolve_asset_path(&base_dir, &app_handle) {
            println!(
                "🔍 [Balloon Scan] 解決済みパス: {:?}, exists={}, is_dir={}",
                resolved,
                resolved.exists(),
                resolved.is_dir()
            );
            if resolved.exists()
                && resolved.is_dir()
                && let Ok(entries) = std::fs::read_dir(&resolved)
            {
                for entry in entries.flatten() {
                    let path = entry.path();
                    println!("📁 [Balloon Scan] エントリ発見: {:?}", path);
                    if path.is_dir() {
                        let dir_name = entry.file_name().to_string_lossy().to_string();
                        println!("📂 [Balloon Scan] ディレクトリ名: {}", dir_name);
                        if !dir_name.starts_with('.') && scanned_dirs.insert(dir_name.clone()) {
                            let descript = balloon_descript_map(&path);
                            println!(
                                "📝 [Balloon Scan] descript プロパティ数: {}, path={:?}",
                                descript.len(),
                                path
                            );
                            let name = descript
                                .get("name")
                                .cloned()
                                .unwrap_or_else(|| dir_name.clone());

                            let thumbnail = read_balloon_thumbnail_from_dir(&path);

                            let readme = read_balloon_readme_from_dir(&path);

                            balloons.push(BalloonInfo {
                                dir_name,
                                name,
                                descript,
                                thumbnail,
                                readme,
                            });
                        }
                    }
                }
            }
        } else {
            println!("⚠️ [Balloon Scan] 解決失敗: {}", base_dir);
        }
    }

    let mut unique = std::collections::HashMap::new();
    for b in balloons {
        unique.entry(b.dir_name.clone()).or_insert(b);
    }
    let mut result: Vec<_> = unique.into_values().collect();
    result.sort_by(|a, b| a.name.cmp(&b.name));

    println!("🎉 [Balloon Scan] スキャン完了: 総数={}個", result.len());
    Ok(result)
}

pub fn read_balloon_readme_from_dir(dir: &Path) -> Option<String> {
    ["readme.txt", "Readme.txt", "README.TXT"]
        .iter()
        .find_map(|f| {
            let p = dir.join(f);
            if p.is_file() {
                open_text_file(&p).ok()
            } else {
                None
            }
        })
}

pub fn read_balloon_thumbnail_from_dir(dir: &Path) -> Option<String> {
    [
        ("thumbnail.png", "image/png"),
        ("thumbnail.jpg", "image/jpeg"),
        ("thumbnail.bmp", "image/bmp"),
    ]
    .iter()
    .find_map(|(f, mime)| {
        let p = dir.join(f);
        if p.is_file() {
            std::fs::read(&p).ok().map(|bytes| {
                format!(
                    "data:{};base64,{}",
                    mime,
                    base64::engine::general_purpose::STANDARD.encode(bytes)
                )
            })
        } else {
            None
        }
    })
}

#[tauri::command]
pub fn get_balloon_readme(
    name: String,
    app_handle: tauri::AppHandle,
) -> Result<Option<String>, String> {
    let dir = resolve_balloon_dir(&name, &app_handle)?;
    Ok(read_balloon_readme_from_dir(&dir))
}

#[tauri::command]
pub fn get_balloon_thumbnail(
    name: String,
    app_handle: tauri::AppHandle,
) -> Result<Option<String>, String> {
    let dir = resolve_balloon_dir(&name, &app_handle)?;
    Ok(read_balloon_thumbnail_from_dir(&dir))
}

fn resolve_candidate_balloon_dir(dir_name: &str, app_handle: &tauri::AppHandle) -> Option<PathBuf> {
    let mut bases = vec![
        format!("assets/balloon/{}", dir_name),
        format!("balloon/{}", dir_name),
    ];
    if let Ok(ghosts_root) = resolve_asset_path("assets/ghost", app_handle)
        && let Ok(ghosts) = std::fs::read_dir(&ghosts_root)
    {
        for entry in ghosts.flatten() {
            let path = entry.path();
            if path.is_dir() {
                bases.push(
                    path.join("balloon")
                        .join(dir_name)
                        .to_string_lossy()
                        .into_owned(),
                );
                bases.push(
                    path.join("ghost")
                        .join("master")
                        .join("balloon")
                        .join(dir_name)
                        .to_string_lossy()
                        .into_owned(),
                );
            }
        }
    } else if let Ok(ghosts) = std::fs::read_dir("assets/ghost") {
        for entry in ghosts.flatten() {
            let path = entry.path();
            if path.is_dir() {
                bases.push(
                    path.join("balloon")
                        .join(dir_name)
                        .to_string_lossy()
                        .into_owned(),
                );
                bases.push(
                    path.join("ghost")
                        .join("master")
                        .join("balloon")
                        .join(dir_name)
                        .to_string_lossy()
                        .into_owned(),
                );
            }
        }
    }
    for base in &bases {
        let direct = PathBuf::from(base);
        if direct.is_dir() {
            return Some(direct);
        }
        if let Ok(resolved) = resolve_asset_path(base, app_handle)
            && resolved.is_dir()
        {
            return Some(resolved);
        }
    }
    None
}

pub fn resolve_balloon_dir(name: &str, app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    println!("🔍 [Balloon] resolve_balloon_dir 呼び出し: name='{}'", name);
    let effective_name = if name.is_empty() || name.eq_ignore_ascii_case("default") {
        "nam"
    } else {
        name
    };

    let scanned_opt = scan_balloons(app_handle.clone()).ok();
    if let Some(ref scanned) = scanned_opt {
        let norm_target = effective_name.trim().to_lowercase();
        for b in scanned {
            let b_dir = b.dir_name.trim().to_lowercase();
            let b_name = b.name.trim().to_lowercase();
            if (b_dir == norm_target || b_name == norm_target)
                && let Some(resolved) = resolve_candidate_balloon_dir(&b.dir_name, app_handle)
            {
                return Ok(resolved);
            }
        }
        for b in scanned {
            let b_dir = b.dir_name.trim().to_lowercase();
            let b_name = b.name.trim().to_lowercase();
            if (b_dir.contains(&norm_target)
                || norm_target.contains(&b_dir)
                || b_name.contains(&norm_target))
                && let Some(resolved) = resolve_candidate_balloon_dir(&b.dir_name, app_handle)
            {
                return Ok(resolved);
            }
        }
    }

    let search_bases = vec![
        format!("assets/balloon/{}", effective_name),
        format!("balloon/{}", effective_name),
        "assets/balloon/nam".to_string(),
        "assets/balloon/default".to_string(),
    ];

    let mut all_search_bases = search_bases;

    if let Ok(ghosts) = std::fs::read_dir("assets/ghost") {
        for entry in ghosts.flatten() {
            let path = entry.path();
            if path.is_dir() {
                all_search_bases.push(
                    path.join("balloon")
                        .join(effective_name)
                        .to_string_lossy()
                        .into_owned(),
                );
                all_search_bases.push(
                    path.join("ghost")
                        .join("master")
                        .join("balloon")
                        .join(effective_name)
                        .to_string_lossy()
                        .into_owned(),
                );
            }
        }
    }

    for base in &all_search_bases {
        if let Ok(resolved) = resolve_asset_path(base, app_handle)
            && resolved.is_dir()
        {
            return Ok(resolved);
        }
    }

    if let Some(ref scanned) = scanned_opt
        && let Some(first) = scanned.first()
        && let Some(resolved) = resolve_candidate_balloon_dir(&first.dir_name, app_handle)
    {
        return Ok(resolved);
    }

    if let Ok(resolved_root) = resolve_asset_path("assets/balloon", app_handle)
        && resolved_root.is_dir()
        && let Ok(entries) = std::fs::read_dir(resolved_root)
    {
        for entry in entries.flatten() {
            let p = entry.path();
            if p.is_dir() {
                return Ok(p);
            }
        }
    }

    Err(format!("balloon directory not found: {}", name))
}

#[tauri::command]
pub fn list_balloons(app_handle: tauri::AppHandle) -> Result<Vec<BalloonInfo>, String> {
    scan_balloons(app_handle)
}
