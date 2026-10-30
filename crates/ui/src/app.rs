#![allow(non_snake_case)]
#![allow(unused)]

use std::fs;
use std::path::PathBuf;

/// ghostディレクトリのパスを取得
pub fn get_ghost_dir() -> PathBuf {
    // プロジェクトルート直下のghostディレクトリ
    PathBuf::from("ghost")
}

/// ghostディレクトリ直下のディレクトリ一覧を取得
pub fn get_ghost_dir_list() -> Vec<String> {
    let ghost_dir = get_ghost_dir();
    let mut list = Vec::new();
    let Ok(entries) = fs::read_dir(&ghost_dir) else {
        return list;
    };
    for entry in entries.flatten() {
        if entry.path().is_dir()
            && let Some(name) = entry.file_name().to_str()
        {
            list.push(name.to_string());
        }
    }
    list
}

// ファイル名のみを抽出する関数
pub fn extract_filename(path: &str) -> String {
    std::path::Path::new(path)
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or(path)
        .to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_ghost_dir() {
        assert_eq!(get_ghost_dir(), PathBuf::from("ghost"));
    }

    #[test]
    fn test_extract_filename() {
        assert_eq!(
            extract_filename("assets/ghost/mock_nanai/surfaces.txt"),
            "surfaces.txt"
        );
        assert_eq!(extract_filename("surfaces.txt"), "surfaces.txt");
        assert_eq!(extract_filename(""), "");
    }

    #[test]
    fn test_get_ghost_dir_list() {
        let _list = get_ghost_dir_list();
    }

    #[test]
    fn test_get_ghost_dir_list_with_mock() {
        let ghost_dir = get_ghost_dir();
        let _ = fs::remove_dir_all(&ghost_dir);
        assert!(get_ghost_dir_list().is_empty());

        let _ = fs::create_dir_all(&ghost_dir);
        let mock_ghost = ghost_dir.join("mock_ghost_test_dir");
        let _ = fs::create_dir_all(&mock_ghost);
        let mock_file = ghost_dir.join("not_a_dir.txt");
        let _ = fs::write(&mock_file, "test");

        let list = get_ghost_dir_list();
        assert!(list.contains(&"mock_ghost_test_dir".to_string()));
        assert!(!list.contains(&"not_a_dir.txt".to_string()));

        let _ = fs::remove_file(&mock_file);
        let _ = fs::remove_dir_all(&mock_ghost);
        let _ = fs::remove_dir(&ghost_dir);
    }
}
