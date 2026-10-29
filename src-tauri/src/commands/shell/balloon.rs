use crate::common::*;
use base64::Engine;
use std::path::PathBuf;

#[derive(serde::Serialize, Clone)]
pub struct BalloonInfo {
    pub dir_name: String,
    pub name: String,
    pub descript: std::collections::BTreeMap<String, String>,
}

#[tauri::command]
pub fn scan_balloons(app_handle: tauri::AppHandle) -> Result<Vec<BalloonInfo>, String> {
    let mut balloons = Vec::new();
    for base_dir in ["assets/balloon", "balloon"] {
        if let Ok(resolved) = resolve_asset_path(base_dir, &app_handle)
            && resolved.exists()
            && resolved.is_dir()
            && let Ok(entries) = std::fs::read_dir(&resolved)
        {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_dir() {
                    let dir_name = entry.file_name().to_string_lossy().to_string();
                    if !dir_name.starts_with('.') {
                        let descript = balloon_descript_map(&path);
                        // [name,バルーン名]: descript.get("name")
                        let name = descript
                            .get("name")
                            .cloned()
                            .unwrap_or_else(|| dir_name.clone());
                        balloons.push(BalloonInfo {
                            dir_name,
                            name,
                            descript,
                        });
                    }
                }
            }
        }
    }

    let mut unique = std::collections::HashMap::new();
    for b in balloons {
        unique.entry(b.dir_name.clone()).or_insert(b);
    }
    let mut result: Vec<_> = unique.into_values().collect();
    result.sort_by(|a, b| a.name.cmp(&b.name));

    Ok(result)
}

#[tauri::command]
pub fn balloon_manifest(
    name: String,
    app_handle: tauri::AppHandle,
) -> Result<std::collections::BTreeMap<String, String>, String> {
    let dir = resolve_balloon_dir(&name, &app_handle)?;
    Ok(balloon_descript_map(&dir))
}

#[tauri::command]
pub fn load_balloon_image(
    name: String,
    file: String,
    app_handle: tauri::AppHandle,
) -> Result<Option<String>, String> {
    let dir = resolve_balloon_dir(&name, &app_handle)?;
    let Some(path) = nanai_android_mascot_ui::resolve_vfs_path(&dir, &file) else {
        return Ok(None);
    };
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
        _ => "application/octet-stream",
    };
    Ok(Some(format!(
        "data:{mime};base64,{}",
        base64::engine::general_purpose::STANDARD.encode(bytes)
    )))
}

pub fn resolve_balloon_dir(name: &str, app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    for base in [
        format!("assets/balloon/{}", name),
        format!("balloon/{}", name),
    ] {
        if let Ok(resolved) = resolve_asset_path(&base, app_handle)
            && resolved.is_dir()
        {
            return Ok(resolved);
        }
    }
    Err(format!("balloon directory not found: {}", name))
}

/// [descript.txt（Balloonの）]: バルーン descript.txt パース処理
/// [charset,文字コード], [type,種別], [craftman,作者名], [craftmanw,作者名], [craftmanurl,URL], [homeurl,URL]
pub fn balloon_descript_map(dir: &std::path::Path) -> std::collections::BTreeMap<String, String> {
    let descript = dir.join("descript.txt");
    let content = nanai_android_mascot_ui::open_text_file(&descript).unwrap_or_default();
    let parsed = nanai_android_mascot_ui::Descript::parse(&content);
    // [charset,文字コード], [type,種別], [craftman,作者名], [craftmanw,作者名], [craftmanurl,URL], [homeurl,URL]:
    parsed
        .properties
        .into_iter()
        .collect::<std::collections::BTreeMap<_, _>>()
}
