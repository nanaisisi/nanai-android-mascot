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
            nanai_vfs::resolve_vfs_path(base, &normalized)
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

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    #[test]
    fn test_load_menu_bitmap_returns_none_when_missing_without_side_effects() {
        let temp_root = std::env::temp_dir().join("nanai_test_menu_bitmap");
        let _ = fs::remove_dir_all(&temp_root);
        let shell_dir = temp_root.join("shell").join("master");
        let ghost_master_dir = temp_root.join("ghost").join("master");
        fs::create_dir_all(&shell_dir).unwrap();
        fs::create_dir_all(&ghost_master_dir).unwrap();

        assert_eq!(
            load_menu_bitmap_data_url(
                "menu_background.png",
                &shell_dir,
                &ghost_master_dir,
                &temp_root
            ),
            None
        );
        assert_eq!(
            load_menu_bitmap_data_url(
                "menu_foreground.png",
                &shell_dir,
                &ghost_master_dir,
                &temp_root
            ),
            None
        );
        assert_eq!(
            load_menu_bitmap_data_url(
                "menu_sidebar.png",
                &shell_dir,
                &ghost_master_dir,
                &temp_root
            ),
            None
        );
        assert!(!shell_dir.join("menu_sidebar.png").exists());

        let _ = fs::remove_dir_all(&temp_root);
    }

    #[test]
    fn test_load_menu_bitmap_reads_external_file() {
        let temp_root = std::env::temp_dir().join("nanai_test_menu_bitmap_load");
        let _ = fs::remove_dir_all(&temp_root);
        let shell_dir = temp_root.join("shell").join("master");
        let ghost_master_dir = temp_root.join("ghost").join("master");
        fs::create_dir_all(&shell_dir).unwrap();
        fs::create_dir_all(&ghost_master_dir).unwrap();

        let dummy_bytes = b"\x89PNG\r\n\x1a\n";
        fs::write(shell_dir.join("menu_sidebar.png"), dummy_bytes).unwrap();
        let res = load_menu_bitmap_data_url(
            "menu_sidebar.png",
            &shell_dir,
            &ghost_master_dir,
            &temp_root,
        );
        assert!(res.is_some());
        assert!(res.unwrap().starts_with("data:image/png;base64,"));

        let _ = fs::remove_dir_all(&temp_root);
    }
}
