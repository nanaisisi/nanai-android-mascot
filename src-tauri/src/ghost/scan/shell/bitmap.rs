use base64::Engine;
use std::path::Path;

/// メニュー画像（background / foreground / sidebar）を読み込んで Data URL (base64) に変換する
pub fn load_menu_bitmap_data_url(
    rel_path: &str,
    shell_dir: &Path,
    ghost_master_dir: &Path,
    ghost_dir: &Path,
) -> Option<String> {
    let normalized = rel_path.trim().replace('\\', "/");
    if normalized.is_empty() {
        return None;
    }
    if normalized.starts_with("data:")
        || normalized.starts_with("http://")
        || normalized.starts_with("https://")
    {
        return Some(normalized);
    }

    let search_bases = [shell_dir, ghost_master_dir, ghost_dir];
    for base in search_bases {
        let direct = base.join(&normalized);
        let resolved = if direct.is_file() {
            Some(direct)
        } else {
            nanai_android_mascot_ui::resolve_vfs_path(base, &normalized)
        };
        if let Some(target) = resolved
            && target.is_file()
            && let Ok(bytes) = std::fs::read(&target)
        {
            let ext = target
                .extension()
                .and_then(|e| e.to_str())
                .unwrap_or("png")
                .to_ascii_lowercase();
            let mime = match ext.as_str() {
                "bmp" => "image/bmp",
                "jpg" | "jpeg" => "image/jpeg",
                "gif" => "image/gif",
                "svg" => "image/svg+xml",
                "webp" => "image/webp",
                _ => "image/png",
            };
            let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
            return Some(format!("data:{mime};base64,{b64}"));
        }
    }
    None
}
