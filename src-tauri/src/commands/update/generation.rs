//! Update definition generation implementation (updates2.dau / updates.txt)
//! spec/update-file/generation.md 準拠

use crate::common::*;
use walkdir::WalkDir;

#[tauri::command]
pub async fn generate_updates2_dau(
    target_dir: String,
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    let dir = resolve_asset_path(&target_dir, &app_handle).map_err(|e| e.to_string())?;
    if !dir.is_dir() {
        return Err(format!("Not a directory: {}", target_dir));
    }

    let mut noupdate_files = Vec::new();
    let dev_opt_path = dir.join("developer_options.txt");
    if dev_opt_path.is_file() {
        if let Ok(content) = std::fs::read_to_string(&dev_opt_path) {
            for line in content.lines() {
                let trimmed = line.trim();
                if trimmed.starts_with("noupdate=") {
                    let file_pattern = trimmed[9..].trim().replace('\\', "/");
                    noupdate_files.push(file_pattern);
                }
            }
        }
    }

    let mut lines = Vec::new();
    let walker = WalkDir::new(&dir).follow_links(false).sort_by_file_name();

    for entry in walker.into_iter().filter_map(|e| e.ok()) {
        let path = entry.path();
        if path.is_file() {
            let rel_path = match path.strip_prefix(&dir) {
                Ok(p) => p.to_string_lossy().replace('\\', "/"),
                Err(_) => continue,
            };

            let file_name = path.file_name().and_then(|n| n.to_str()).unwrap_or("");
            if file_name.starts_with('.') || file_name == "updates2.dau" || file_name == "updates.txt" {
                continue;
            }

            let mut skip = false;
            for pattern in &noupdate_files {
                if rel_path == *pattern || rel_path.ends_with(pattern) {
                    skip = true;
                    break;
                }
            }
            if skip {
                continue;
            }

            if let Some(md5) = super::dau::calculate_file_md5(path) {
                let size = std::fs::metadata(path).map(|m| m.len()).unwrap_or(0);
                lines.push(format!("{}\x01{}\x01size={}", rel_path, md5, size));
            }
        }
    }

    let content = lines.join("\r\n");
    let dau_path = dir.join("updates2.dau");
    std::fs::write(&dau_path, &content).map_err(|e| e.to_string())?;

    let ghost_master = dir.join("ghost").join("master");
    if ghost_master.is_dir() {
        let master_dau = ghost_master.join("updates2.dau");
        std::fs::write(&master_dau, &content).ok();
    }

    Ok(format!("Generated updates2.dau with {} entries", lines.len()))
}
