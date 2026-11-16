use super::{open_text_file, resolve_asset_path, resolve_vfs_path};
use crate::ui_adapter::shell::Descript;
use base64::Engine;
use std::path::PathBuf;

#[derive(serde::Serialize, Clone)]
pub struct BalloonInfo {
    dir_name: String,
    name: String,
    descript: std::collections::BTreeMap<String, String>,
    thumbnail: Option<String>,
    readme: Option<String>,
}

#[allow(dead_code)]
impl BalloonInfo {
    // Add getter methods
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
    let mut search_paths = vec![
        "assets/balloon".to_string(),
        "balloon".to_string(),
    ];

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
                search_paths.push(
                    path.join("balloon").to_string_lossy().into_owned(),
                );
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

                            let thumbnail = ["thumbnail.png", "thumbnail.jpg", "thumbnail.bmp"]
                                .iter()
                                .find_map(|f| {
                                    let p = path.join(f);
                                    if p.is_file() {
                                        std::fs::read(&p).ok().map(|bytes| {
                                            format!(
                                                "data:image/png;base64,{}",
                                                base64::engine::general_purpose::STANDARD.encode(bytes)
                                            )
                                        })
                                    } else {
                                        None
                                    }
                                });

                            let readme =
                                ["readme.txt", "Readme.txt", "README.TXT"]
                                    .iter()
                                    .find_map(|f| {
                                        let p = path.join(f);
                                        if p.is_file() {
                                            open_text_file(&p).ok()
                                        } else {
                                            None
                                        }
                                    });

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

#[tauri::command]
pub fn get_balloon_readme(
    name: String,
    app_handle: tauri::AppHandle,
) -> Result<Option<String>, String> {
    let dir = resolve_balloon_dir(&name, &app_handle)?;
    for f in ["readme.txt", "Readme.txt", "README.TXT"] {
        let p = dir.join(f);
        if p.is_file() {
            return Ok(open_text_file(&p).ok());
        }
    }
    Ok(None)
}

#[tauri::command]
pub fn balloon_manifest(
    name: String,
    scope_id: Option<i32>,
    #[allow(non_snake_case)]
    scopeId: Option<i32>,
    surface_id: Option<i32>,
    #[allow(non_snake_case)]
    surfaceId: Option<i32>,
    app_handle: tauri::AppHandle,
) -> Result<std::collections::BTreeMap<String, String>, String> {
    let s_id = scope_id.or(scopeId);
    let surf_id = surface_id.or(surfaceId);
    let dir = resolve_balloon_dir(&name, &app_handle)?;
    let mut map = balloon_descript_map(&dir);

    if let Some(sid) = s_id {
        let prefix = if sid == 1 { "balloonk" } else { "balloons" };
        let candidates = if let Some(surf) = surf_id {
            vec![
                format!("{}{}{}s.txt", prefix, surf, sid),
                format!("{}0s.txt", prefix),
                format!("{}s.txt", prefix),
            ]
        } else {
            vec![format!("{}0s.txt", prefix), format!("{}s.txt", prefix)]
        };
        for cand in candidates {
            let p = dir.join(&cand);
            if p.is_file()
                && let Some(sub_map) = resolve_vfs_path(&dir, &cand)
                    .and_then(|fp| crate::ghost::scan::read_descript_file(&fp))
            {
                for (k, v) in sub_map {
                    map.insert(k, v);
                }
                break;
            }
        }
    }

    Ok(map)
}

#[tauri::command]
pub fn load_balloon_image(
    name: String,
    file: String,
    app_handle: tauri::AppHandle,
) -> Result<Option<String>, String> {
    let dir = match resolve_balloon_dir(&name, &app_handle) {
        Ok(d) => d,
        Err(_) => {
            println!(
                "⚠️ [Balloon] load_balloon_image: balloon directory not found for name='{}'",
                name
            );
            return Ok(None);
        }
    };

    let direct_path = dir.join(&file);
    let found_path = if direct_path.is_file() {
        Some(direct_path)
    } else if let Some(stem) = std::path::Path::new(&file)
        .file_stem()
        .and_then(|s| s.to_str())
    {
        let extensions = [
            "png", "bmp", "jpg", "jpeg", "pna", "gif", "svg", "PNG", "BMP",
            "JPG", "JPEG", "SVG",
        ];
        let mut matched = None;
        for ext in &extensions {
            let alt_file = format!("{}.{}", stem, ext);
            let p = dir.join(&alt_file);
            if p.is_file() {
                matched = Some(p);
                break;
            }
        }
        if matched.is_none() {
            if let Some(stripped_stem) = stem.strip_suffix('0') {
                for ext in &extensions {
                    let alt_file = format!("{}.{}", stripped_stem, ext);
                    let p = dir.join(&alt_file);
                    if p.is_file() {
                        matched = Some(p);
                        break;
                    }
                }
            }
        }
        matched
    } else {
        None
    };

    let Some(path) = found_path else {
        println!(
            "⚠️ [Balloon] load_balloon_image 見つからず: name={}, file={}",
            name, file
        );
        return Ok(None);
    };

    println!("✅ [Balloon] load_balloon_image 成功: path={:?}", path);
    let Ok(bytes) = std::fs::read(&path) else {
        return Ok(None);
    };
    let mime = match path
        .extension()
        .and_then(|e| e.to_str())
        .map(|s| s.to_lowercase())
    {
        Some(ref e) if e == "png" => "image/png",
        Some(ref e) if e == "bmp" => "image/bmp",
        Some(ref e) if e == "jpg" || e == "jpeg" => "image/jpeg",
        Some(ref e) if e == "svg" => "image/svg+xml",
        Some(ref e) if e == "gif" => "image/gif",
        _ => "application/octet-stream",
    };
    Ok(Some(format!(
        "data:{mime};base64,{}",
        base64::engine::general_purpose::STANDARD.encode(bytes)
    )))
}

pub fn resolve_balloon_dir(
    name: &str,
    app_handle: &tauri::AppHandle,
) -> Result<PathBuf, String> {
    println!("🔍 [Balloon] resolve_balloon_dir 呼び出し: name='{}'", name);
    let effective_name = if name.is_empty() { "default" } else { name };

    let mut search_bases = vec![
        format!("assets/balloon/{}", effective_name),
        format!("balloon/{}", effective_name),
        "assets/balloon/nsm".to_string(),
        "assets/balloon/default".to_string(),
    ];

    if effective_name == "default" {
        search_bases.insert(0, "assets/balloon/nsm".to_string());
    }

    if let Ok(ghosts) = std::fs::read_dir("assets/ghost") {
        for entry in ghosts.flatten() {
            let path = entry.path();
            if path.is_dir() {
                search_bases.push(
                    path.join("balloon")
                        .join(effective_name)
                        .to_string_lossy()
                        .into_owned(),
                );
                search_bases.push(
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

    for base in &search_bases {
        if let Ok(resolved) = resolve_asset_path(base, app_handle)
            && resolved.is_dir()
        {
            return Ok(resolved);
        }
    }

    // 最終フォールバック: assets/balloon 内の最初のディレクトリを返す
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

/// [descript.txt（Balloonの）]: バルーン descript.txt パース処理
/// [charset,文字コード], [type,種別], [craftman,作者名], [craftmanw,作者名], [craftmanurl,URL], [homeurl,URL]
pub fn balloon_descript_map(dir: &std::path::Path) -> std::collections::BTreeMap<String, String> {
    let descript = dir.join("descript.txt");
    let path_str = descript.to_string_lossy();
    let clean_path = crate::common::paths::clean_verbatim_path(&path_str);
    let content = open_text_file(std::path::Path::new(&clean_path)).unwrap_or_default();
    let parsed = Descript::parse(&content);
    parsed
        .properties()
        .clone()
        .into_iter()
        .collect::<std::collections::BTreeMap<_, _>>()
}

#[tauri::command]
pub fn list_balloons(app_handle: tauri::AppHandle) -> Result<Vec<BalloonInfo>, String> {
    scan_balloons(app_handle)
}
