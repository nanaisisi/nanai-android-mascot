use std::path::{Path, PathBuf};

/// パス文字列をスラッシュ区切りかつ冗長な `./` や `../` を整理した正規化形式へ変換
pub fn normalize_vfs_path(path: &str) -> String {
    let mut parts = Vec::new();
    for part in path.split(['/', '\\']) {
        if part.is_empty() || part == "." {
            continue;
        }
        if part == ".." {
            parts.pop();
        } else {
            parts.push(part);
        }
    }
    parts.join("/")
}

/// 大文字・小文字の差異を吸収してファイルパスを解決する VFS リゾルバー（Linux/Android対応）
pub fn resolve_vfs_path(base_dir: &Path, relative_path: &str) -> Option<PathBuf> {
    let mut current = base_dir.to_path_buf();

    // 高速パス: base_dir + relative_path で直接ファイルまたはディレクトリが存在する場合
    let direct_combined = base_dir.join(relative_path);
    if direct_combined.exists() {
        return Some(direct_combined);
    }

    for part in relative_path.split(['/', '\\']) {
        if part.is_empty() || part == "." {
            continue;
        }
        if part == ".." {
            current.pop();
            continue;
        }

        // 高速パス: その階層で直接一致するエントリが存在する場合
        let direct_step = current.join(part);
        if direct_step.exists() {
            current = direct_step;
            continue;
        }

        // 大文字小文字を無視して一致するエントリを探索
        let target_lower = part.to_lowercase();
        let mut matched = None;
        if let Ok(entries) = std::fs::read_dir(&current) {
            for entry in entries.flatten() {
                if entry.file_name().to_string_lossy().to_lowercase() == target_lower {
                    matched = Some(entry.path());
                    break;
                }
            }
        }
        current = matched?;
    }
    Some(current)
}
