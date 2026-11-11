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

    // ゴーストにメニュー背景画像がない場合、内部保持の白背景PNGデータURLをメモリ上で返却（ファイル書き込みなし）
    if normalized.to_ascii_lowercase().contains("background")
        || normalized.to_ascii_lowercase().contains("menu")
        || normalized == "menu_background.png"
    {
        let white_png: &[u8] = &[
            0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48,
            0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00,
            0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, 0x54, 0x08,
            0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00, 0x00, 0x03, 0x01, 0x01, 0x18, 0xdd, 0x8d, 0xb0,
            0x32, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
        ];
        let b64 = base64::engine::general_purpose::STANDARD.encode(white_png);
        return Some(format!("data:image/png;base64,{b64}"));
    }

    // ホバー時（foreground / cursor / fg）の画像がない場合、内部保持の黒画像（1x1 solid black PNG）をメモリ上で返却
    if normalized.to_ascii_lowercase().contains("foreground")
        || normalized.to_ascii_lowercase().contains("cursor")
        || normalized.to_ascii_lowercase().contains("fg")
        || normalized == "menu_foreground.png"
    {
        let black_png: &[u8] = &[
            0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48,
            0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00,
            0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, 0x54, 0x08,
            0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00, 0x00, 0x03, 0x01, 0x01, 0x18, 0xdd, 0x8d, 0xb0,
            0x32, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
        ];
        let b64 = base64::engine::general_purpose::STANDARD.encode(black_png);
        return Some(format!("data:image/png;base64,{b64}"));
    }

    // サイドバー画像がない場合に menu_sidebar.png 画像を作成
    if normalized.to_ascii_lowercase().contains("sidebar") || normalized == "menu_sidebar.png" {
        let target_path = shell_dir.join(&normalized);
        if let Some(parent) = target_path.parent() {
            let _ = std::fs::create_dir_all(parent);
        }
        if !target_path.is_file() {
            let sidebar_png: &[u8] = &[
                0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48,
                0x44, 0x52, 0x00, 0x00, 0x00, 0x18, 0x00, 0x00, 0x00, 0x20, 0x08, 0x02, 0x00, 0x00,
                0x00, 0xb8, 0x59, 0x6e, 0x91, 0x00, 0x00, 0x00, 0x1b, 0x49, 0x44, 0x41, 0x54, 0x78,
                0x9c, 0x63, 0xf8, 0xcf, 0xc0, 0xf0, 0x1f, 0x03, 0x13, 0x35, 0x68, 0x12, 0x27, 0xa1,
                0x28, 0x4c, 0x98, 0x19, 0x33, 0x66, 0x0c, 0x00, 0x00, 0x68, 0x3d, 0x0b, 0xe5, 0x77,
                0x6b, 0x08, 0x4d, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60,
                0x82,
            ];
            let _ = std::fs::write(&target_path, sidebar_png);
        }
        if let Ok(bytes) = std::fs::read(&target_path) {
            let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
            return Some(format!("data:image/png;base64,{b64}"));
        }
    }

    None
}
