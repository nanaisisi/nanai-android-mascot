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

fn read_balloon_readme_from_dir(dir: &std::path::Path) -> Option<String> {
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

fn read_balloon_thumbnail_from_dir(dir: &std::path::Path) -> Option<String> {
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

#[tauri::command]
pub fn balloon_manifest(
    name: String,
    scope_id: Option<i32>,
    #[allow(non_snake_case)] scopeId: Option<i32>,
    surface_id: Option<i32>,
    #[allow(non_snake_case)] surfaceId: Option<i32>,
    balloon_id: Option<i32>,
    #[allow(non_snake_case)] balloonId: Option<i32>,
    is_input_box: Option<bool>,
    #[allow(non_snake_case)] isInputBox: Option<bool>,
    app_handle: tauri::AppHandle,
) -> Result<std::collections::BTreeMap<String, String>, String> {
    let s_id = scope_id.or(scopeId);
    let surf_id = surface_id.or(surfaceId);
    let b_id = balloon_id.or(balloonId);
    let input_box = is_input_box.or(isInputBox).unwrap_or(false);
    let dir = resolve_balloon_dir(&name, &app_handle)?;
    let mut map = balloon_descript_map(&dir);
    merge_balloon_option_files(&dir, s_id, surf_id, b_id, input_box, &mut map);
    Ok(map)
}

/// バルーン個別設定ファイル (`balloons*s.txt` / `balloonk*s.txt` / `balloonp*def*s.txt` / `balloonc*s.txt`) の
/// 探索候補リストを優先度順に生成する
fn resolve_balloon_option_candidates(
    scope_id: Option<i32>,
    surface_id: Option<i32>,
    balloon_id: Option<i32>,
    is_input_box: bool,
) -> Vec<String> {
    let mut candidates = Vec::new();
    if is_input_box {
        if let Some(b) = balloon_id {
            candidates.push(format!("balloonc{}s.txt", b));
        }
        candidates.push("balloonc0s.txt".to_string());
        candidates.push("ballooncs.txt".to_string());
        return candidates;
    }

    if let Some(sid) = scope_id {
        if sid >= 2 {
            if let Some(b) = balloon_id {
                candidates.push(format!("balloonp{}def{}s.txt", sid, b));
                candidates.push(format!("balloonpdef{}s.txt", b));
            }
            candidates.push(format!("balloonp{}def0s.txt", sid));
            candidates.push(format!("balloonp{}defs.txt", sid));
            candidates.push("balloonpdef0s.txt".to_string());
            candidates.push("balloonpdefs.txt".to_string());
            // 省略時は balloonk、さらになければ balloons にフォールバック
            for prefix in ["balloonk", "balloons"] {
                if let Some(b) = balloon_id {
                    candidates.push(format!("{}{}s.txt", prefix, b));
                }
                candidates.push(format!("{}0s.txt", prefix));
                candidates.push(format!("{}s.txt", prefix));
            }
        } else {
            let prefix = if sid == 1 { "balloonk" } else { "balloons" };
            if let Some(surf) = surface_id {
                candidates.push(format!("{}{}{}s.txt", prefix, surf, sid));
            }
            if let Some(b) = balloon_id {
                if b == 2 {
                    candidates.push(format!("{}2s.txt", prefix));
                    candidates.push(format!("{}ss.txt", prefix));
                } else {
                    candidates.push(format!("{}{}s.txt", prefix, b));
                }
            }
            candidates.push(format!("{}0s.txt", prefix));
            candidates.push(format!("{}s.txt", prefix));
            candidates.push(format!("{}.txt", prefix));
        }
    } else if let Some(b) = balloon_id {
        let prefix = "balloons";
        if b == 2 {
            candidates.push(format!("{}2s.txt", prefix));
            candidates.push(format!("{}ss.txt", prefix));
        } else {
            candidates.push(format!("{}{}s.txt", prefix, b));
        }
        candidates.push(format!("{}s.txt", prefix));
    }

    candidates
}

fn merge_balloon_option_files(
    dir: &std::path::Path,
    scope_id: Option<i32>,
    surface_id: Option<i32>,
    balloon_id: Option<i32>,
    is_input_box: bool,
    map: &mut std::collections::BTreeMap<String, String>,
) {
    let base_option_files = [
        "balloons.txt",
        "balloonk.txt",
        "balloons0s.txt",
        "balloonk0s.txt",
        "balloonss.txt",
        "balloonks.txt",
    ];
    for opt_file in base_option_files {
        let p = dir.join(opt_file);
        if p.is_file()
            && let Some(sub_map) = resolve_vfs_path(dir, opt_file)
                .and_then(|fp| crate::ghost::scan::read_descript_file(&fp))
        {
            for (k, v) in sub_map {
                map.entry(k).or_insert(v);
            }
        }
    }

    let candidates =
        resolve_balloon_option_candidates(scope_id, surface_id, balloon_id, is_input_box);
    for cand in candidates {
        let p = dir.join(&cand);
        if p.is_file()
            && let Some(sub_map) = resolve_vfs_path(dir, &cand)
                .and_then(|fp| crate::ghost::scan::read_descript_file(&fp))
        {
            for (k, v) in sub_map {
                map.insert(k, v);
            }
            break;
        }
    }
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
    let req_ext = std::path::Path::new(&file)
        .extension()
        .and_then(|e| e.to_str())
        .map(|s| s.to_lowercase());
    let found_path = if direct_path.is_file() {
        Some(direct_path)
    } else if req_ext.as_deref() == Some("pna") {
        std::path::Path::new(&file)
            .file_stem()
            .and_then(|s| s.to_str())
            .and_then(|stem| {
                ["pna", "PNA"].iter().find_map(|ext| {
                    let p = dir.join(format!("{}.{}", stem, ext));
                    p.is_file().then_some(p)
                })
            })
    } else if let Some(stem) = std::path::Path::new(&file)
        .file_stem()
        .and_then(|s| s.to_str())
    {
        let extensions = [
            "png", "bmp", "jpg", "jpeg", "gif", "svg", "PNG", "BMP", "JPG", "JPEG", "GIF", "SVG",
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
        if matched.is_none()
            && matches!(stem, "balloons0" | "balloonk0" | "balloonc0")
            && let Some(stripped_stem) = stem.strip_suffix('0')
        {
            for ext in &extensions {
                let alt_file = format!("{}.{}", stripped_stem, ext);
                let p = dir.join(&alt_file);
                if p.is_file() {
                    matched = Some(p);
                    break;
                }
            }
        }
        if matched.is_none()
            && matches!(
                stem,
                "balloons" | "balloons0" | "balloonk" | "balloonk0" | "balloonc" | "balloonc0"
            )
        {
            let fallback_files = if stem.starts_with("balloonk") {
                vec![
                    "balloonk0.png",
                    "balloonk0.bmp",
                    "balloonk.png",
                    "balloonk.bmp",
                ]
            } else if stem.starts_with("balloonc") {
                vec![
                    "balloonc0.png",
                    "balloonc0.bmp",
                    "balloonc.png",
                    "balloonc.bmp",
                ]
            } else {
                vec![
                    "balloons0.png",
                    "balloons0.bmp",
                    "balloons.png",
                    "balloons.bmp",
                ]
            };
            for fb in fallback_files {
                let p = dir.join(fb);
                if p.is_file() {
                    matched = Some(p);
                    break;
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
    Ok(encode_image_data_url(&path))
}

fn find_sibling_pna(path: &std::path::Path) -> Option<PathBuf> {
    let ext = path
        .extension()
        .and_then(|e| e.to_str())
        .map(|s| s.to_lowercase());
    if ext.as_deref() == Some("pna") {
        return None;
    }
    let stem = path.file_stem()?.to_str()?;
    let parent = path.parent()?;
    ["pna", "PNA"].iter().find_map(|pna_ext| {
        let candidate = parent.join(format!("{}.{}", stem, pna_ext));
        candidate.is_file().then_some(candidate)
    })
}

fn composite_pna_alpha(base_path: &std::path::Path, pna_path: &std::path::Path) -> Option<Vec<u8>> {
    let mut base_img = image::open(base_path).ok()?.to_rgba8();
    let pna_img = image::open(pna_path).ok()?.to_luma8();
    let width = base_img.width().min(pna_img.width());
    let height = base_img.height().min(pna_img.height());

    for y in 0..height {
        for x in 0..width {
            let alpha = pna_img.get_pixel(x, y).0[0];
            base_img.get_pixel_mut(x, y).0[3] = alpha;
        }
    }

    let mut out = Vec::new();
    let mut cursor = std::io::Cursor::new(&mut out);
    image::DynamicImage::ImageRgba8(base_img)
        .write_to(&mut cursor, image::ImageFormat::Png)
        .ok()?;
    Some(out)
}

fn encode_image_data_url(path: &std::path::Path) -> Option<String> {
    if let Some(pna_path) = find_sibling_pna(path)
        && let Some(composited_png) = composite_pna_alpha(path, &pna_path)
    {
        return Some(format!(
            "data:image/png;base64,{}",
            base64::engine::general_purpose::STANDARD.encode(composited_png)
        ));
    }

    let bytes = std::fs::read(path).ok()?;
    let mime = match path
        .extension()
        .and_then(|e| e.to_str())
        .map(|s| s.to_lowercase())
    {
        Some(ref e) if e == "png" || e == "pna" => "image/png",
        Some(ref e) if e == "bmp" => "image/bmp",
        Some(ref e) if e == "jpg" || e == "jpeg" => "image/jpeg",
        Some(ref e) if e == "svg" => "image/svg+xml",
        Some(ref e) if e == "gif" => "image/gif",
        _ => "application/octet-stream",
    };
    Some(format!(
        "data:{mime};base64,{}",
        base64::engine::general_purpose::STANDARD.encode(bytes)
    ))
}

#[tauri::command]
pub fn load_balloon_ui_asset(
    name: String,
    stem: String,
    scope_id: i32,
    app_handle: tauri::AppHandle,
) -> Result<Option<String>, String> {
    let Ok(dir) = resolve_balloon_dir(&name, &app_handle) else {
        return Ok(None);
    };
    let Some(path) = resolve_balloon_ui_asset(&dir, &stem, scope_id) else {
        return Ok(None);
    };
    Ok(encode_image_data_url(&path))
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

    // 1. スキャン一覧の中から dir_name や name (表示名) が一致するフォルダを優先探索
    let scanned_opt = scan_balloons(app_handle.clone()).ok();
    if let Some(ref scanned) = scanned_opt {
        let norm_target = effective_name.trim().to_lowercase();
        // 1-A. 完全一致
        for b in scanned {
            let b_dir = b.dir_name.trim().to_lowercase();
            let b_name = b.name.trim().to_lowercase();
            if (b_dir == norm_target || b_name == norm_target)
                && let Some(resolved) = resolve_candidate_balloon_dir(&b.dir_name, app_handle)
            {
                return Ok(resolved);
            }
        }
        // 1-B. あいまい・部分一致 (例: "emily" ⇄ "emily4")
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

/// バルーン UI 付随画像（ボタン・clickwait・marker・sstp 等）のファイル解決。
/// 種別 `stem`（例: "cancel_up", "clickwait"）に対し、スコープ別
/// (`s`=sakura, `k`=kero, `p<N>`=char N) 派生名 → 無印の順で探し、
/// png/bmp（および透過用 .pna 併存）の実在ファイルのみ返す。
pub fn resolve_balloon_ui_asset(
    dir: &std::path::Path,
    stem: &str,
    scope_id: i32,
) -> Option<PathBuf> {
    let suffix = match scope_id {
        0 => "s".to_string(),
        1 => "k".to_string(),
        n => format!("p{}", n),
    };
    let names = [format!("{}{}", stem, suffix), stem.to_string()];
    for n in &names {
        for ext in ["png", "bmp", "PNG", "BMP"] {
            let p = dir.join(format!("{}.{}", n, ext));
            if p.is_file() {
                return Some(p);
            }
        }
    }
    None
}

#[cfg(test)]
mod ui_asset_tests {
    use super::{
        composite_pna_alpha, encode_image_data_url, find_sibling_pna, resolve_balloon_ui_asset,
    };
    use base64::Engine;

    #[test]
    fn resolves_scope_specific_then_generic() {
        let d = std::env::temp_dir().join("nam_balloon_ui_asset_test");
        let _ = std::fs::remove_dir_all(&d);
        std::fs::create_dir_all(&d).unwrap();
        std::fs::write(d.join("clickwait.png"), b"x").unwrap();
        std::fs::write(d.join("clickwaitk.png"), b"x").unwrap();
        assert!(
            resolve_balloon_ui_asset(&d, "clickwait", 1)
                .unwrap()
                .ends_with("clickwaitk.png")
        );
        assert!(
            resolve_balloon_ui_asset(&d, "clickwait", 0)
                .unwrap()
                .ends_with("clickwait.png")
        );
        assert!(resolve_balloon_ui_asset(&d, "ok_up", 0).is_none());
        let _ = std::fs::remove_dir_all(&d);
    }

    #[test]
    fn composites_sibling_pna_alpha_into_png_data_url() {
        let d = std::env::temp_dir().join("nam_balloon_pna_test");
        let _ = std::fs::remove_dir_all(&d);
        std::fs::create_dir_all(&d).unwrap();

        let base_path = d.join("balloons0.png");
        let pna_path = d.join("balloons0.pna");

        let base_img = image::RgbaImage::from_pixel(2, 2, image::Rgba([255, 10, 20, 255]));
        base_img.save(&base_path).unwrap();

        let mut pna_img = image::GrayImage::new(2, 2);
        pna_img.put_pixel(0, 0, image::Luma([128]));
        pna_img.put_pixel(1, 0, image::Luma([0]));
        pna_img.put_pixel(0, 1, image::Luma([64]));
        pna_img.put_pixel(1, 1, image::Luma([255]));
        pna_img.save(&pna_path).unwrap();

        assert_eq!(
            find_sibling_pna(&base_path).as_deref(),
            Some(pna_path.as_path())
        );
        assert!(find_sibling_pna(&pna_path).is_none());

        let composited = composite_pna_alpha(&base_path, &pna_path).unwrap();
        let decoded = image::load_from_memory(&composited).unwrap().to_rgba8();
        assert_eq!(decoded.get_pixel(0, 0).0, [255, 10, 20, 128]);
        assert_eq!(decoded.get_pixel(1, 0).0, [255, 10, 20, 0]);
        assert_eq!(decoded.get_pixel(0, 1).0, [255, 10, 20, 64]);
        assert_eq!(decoded.get_pixel(1, 1).0, [255, 10, 20, 255]);

        let data_url = encode_image_data_url(&base_path).unwrap();
        assert!(data_url.starts_with("data:image/png;base64,"));
        let b64 = data_url.trim_start_matches("data:image/png;base64,");
        let raw = base64::engine::general_purpose::STANDARD
            .decode(b64)
            .unwrap();
        let decoded_url = image::load_from_memory(&raw).unwrap().to_rgba8();
        assert_eq!(decoded_url.get_pixel(1, 0).0[3], 0);

        let _ = std::fs::remove_dir_all(&d);
    }

    #[test]
    fn reads_balloon_readme_and_thumbnail_from_dir() {
        let d = std::env::temp_dir().join(format!("nam_balloon_rt_{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&d);
        std::fs::create_dir_all(&d).unwrap();

        assert!(super::read_balloon_readme_from_dir(&d).is_none());
        assert!(super::read_balloon_thumbnail_from_dir(&d).is_none());

        std::fs::write(d.join("readme.txt"), "balloon readme").unwrap();
        std::fs::write(d.join("thumbnail.png"), [1u8, 2, 3]).unwrap();

        assert_eq!(
            super::read_balloon_readme_from_dir(&d).as_deref(),
            Some("balloon readme")
        );
        let thumb = super::read_balloon_thumbnail_from_dir(&d).unwrap();
        assert!(thumb.starts_with("data:image/png;base64,"));

        let _ = std::fs::remove_dir_all(&d);
    }

    #[test]
    fn test_resolve_balloon_option_candidates_scope_p_and_input_box() {
        let input_cands = super::resolve_balloon_option_candidates(Some(0), None, Some(2), true);
        assert_eq!(
            input_cands,
            vec![
                "balloonc2s.txt".to_string(),
                "balloonc0s.txt".to_string(),
                "ballooncs.txt".to_string()
            ]
        );

        let p_cands = super::resolve_balloon_option_candidates(Some(2), None, Some(1), false);
        assert_eq!(p_cands[0], "balloonp2def1s.txt");
        assert_eq!(p_cands[1], "balloonpdef1s.txt");
        assert!(p_cands.contains(&"balloonk1s.txt".to_string()));
        assert!(p_cands.contains(&"balloons1s.txt".to_string()));
    }

    #[test]
    fn test_merge_balloon_option_files_overrides_descript() {
        let d = std::env::temp_dir().join(format!("nam_balloon_opt_{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&d);
        std::fs::create_dir_all(&d).unwrap();
        std::fs::write(d.join("balloonp2def0s.txt"), "font.color.r,255\n").unwrap();
        std::fs::write(d.join("balloonc1s.txt"), "font.color.g,128\n").unwrap();

        let mut p_map = std::collections::BTreeMap::new();
        p_map.insert("font.color.r".to_string(), "0".to_string());
        super::merge_balloon_option_files(&d, Some(2), None, Some(0), false, &mut p_map);
        assert_eq!(p_map.get("font.color.r").map(String::as_str), Some("255"));

        let mut c_map = std::collections::BTreeMap::new();
        c_map.insert("font.color.g".to_string(), "0".to_string());
        super::merge_balloon_option_files(&d, None, None, Some(1), true, &mut c_map);
        assert_eq!(c_map.get("font.color.g").map(String::as_str), Some("128"));

        let _ = std::fs::remove_dir_all(&d);
    }
}
