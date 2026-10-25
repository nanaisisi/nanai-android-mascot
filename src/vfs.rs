use std::fs::File;
use std::io::{self, Read};
use std::path::{Path, PathBuf};
use encoding_rs::SHIFT_JIS;

/// テキストファイルを自動判定（UTF-8 / BOM / Shift_JIS）で開き、UTF-8文字列として返す
pub fn open_text_file(path: &Path) -> Result<String, io::Error> {
    let mut file = File::open(path)?;
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer)?;

    // 1. UTF-8 BOM チェック (0xEF, 0xBB, 0xBF)
    if buffer.starts_with(&[0xEF, 0xBB, 0xBF])
        && let Ok(utf8_str) = std::str::from_utf8(&buffer[3..])
    {
        return Ok(utf8_str.to_string());
    }

    // 2. 標準 UTF-8 としてのパース試行
    if let Ok(utf8_str) = std::str::from_utf8(&buffer) {
        return Ok(utf8_str.to_string());
    }

    // 3. Shift_JIS / CP932 フォールバックデコード
    let (cow, _encoding_used, had_errors) = SHIFT_JIS.decode(&buffer);
    if had_errors {
        eprintln!(
            "Warning: Some Shift_JIS characters couldn't be decoded properly in {:?}",
            path
        );
    }

    Ok(cow.into_owned())
}

/// 後方互換用エイリアス
pub fn open_shift_jis_file(path: &str) -> Result<String, io::Error> {
    open_text_file(Path::new(path))
}

/// 大文字・小文字の差異を吸収してファイルパスを解決する VFS リゾルバー（Linux/Android対応）
pub fn resolve_vfs_path(base_dir: &Path, relative_path: &str) -> Option<PathBuf> {
    let mut current = base_dir.to_path_buf();
    for part in relative_path.split(['/', '\\']) {
        if part.is_empty() || part == "." {
            continue;
        }
        if part == ".." {
            current.pop();
            continue;
        }

        // 完全一致を試行
        let direct = current.join(part);
        if direct.exists() {
            current = direct;
            continue;
        }

        // 大文字小文字を無視して一致するエントリを探索
        let target_lower = part.to_lowercase();
        let found = std::fs::read_dir(&current).ok()?.find_map(|entry| {
            let entry = entry.ok()?;
            let name = entry.file_name().to_string_lossy().to_string();
            if name.to_lowercase() == target_lower {
                Some(entry.path())
            } else {
                None
            }
        });

        {
            let p = found?;
            current = p
        }
    }
    Some(current)
}
