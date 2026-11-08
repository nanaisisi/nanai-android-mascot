use std::path::{Path, PathBuf};

/// Windowsの予約デバイス名（CON, PRN, AUX, NUL, COM1-9, LPT1-9）に該当するか判定
pub fn is_windows_reserved_name(name: &str) -> bool {
    // 拡張子を除いたベース名を取得
    let stem = match name.split('.').next() {
        Some(s) => s.trim(),
        None => return false,
    };
    if stem.is_empty() {
        return false;
    }
    let lower = stem.to_ascii_lowercase();
    matches!(
        lower.as_str(),
        "con"
            | "prn"
            | "aux"
            | "nul"
            | "com1"
            | "com2"
            | "com3"
            | "com4"
            | "com5"
            | "com6"
            | "com7"
            | "com8"
            | "com9"
            | "lpt1"
            | "lpt2"
            | "lpt3"
            | "lpt4"
            | "lpt5"
            | "lpt6"
            | "lpt7"
            | "lpt8"
            | "lpt9"
    )
}

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

/// パス文字列が安全な相対パス（Nullバイトを含まず、親ディレクトリ脱出を行わない）か検証
pub fn is_safe_vfs_path(path: &str) -> bool {
    // Nullバイトまたは不正制御文字チェック
    if path.contains('\0') {
        return false;
    }

    let trimmed = path.trim();

    // URI スキームプレフィックス (file://, http://, ftp:// 等)
    if trimmed.contains("://") {
        return false;
    }

    // Windows ドライブレター (`C:`, `D:`) または絶対プレフィックス (`/`, `\`)
    if trimmed.starts_with('/') || trimmed.starts_with('\\') {
        return false;
    }
    if trimmed.len() >= 2
        && trimmed.as_bytes()[1] == b':'
        && trimmed.as_bytes()[0].is_ascii_alphabetic()
    {
        return false;
    }

    // NTFS 代替データストリーム (`filename:stream`) や不正コロンの検査
    // (ドライブレター以外でのコロンの存在を拒絶)
    if trimmed.contains(':') {
        return false;
    }

    // `..` によるルート外脱出の検証、および各セグメントの予約名検査
    let mut depth: isize = 0;
    for part in trimmed.split(['/', '\\']) {
        let part_trimmed = part.trim();
        if part_trimmed.is_empty() || part_trimmed == "." {
            continue;
        }
        if part_trimmed == ".." {
            depth -= 1;
            if depth < 0 {
                return false;
            }
        } else {
            // Windows予約デバイス名（CON, PRN, AUX, NUL等）の検査
            if is_windows_reserved_name(part_trimmed) {
                return false;
            }
            depth += 1;
        }
    }

    true
}

/// パスをサニタイズして安全な正規化相対パスを返す。安全でない場合は `None` を返す。
pub fn sanitize_vfs_path(path: &str) -> Option<String> {
    if !is_safe_vfs_path(path) {
        return None;
    }
    let norm = normalize_vfs_path(path);
    if norm.is_empty() { None } else { Some(norm) }
}

/// 大文字・小文字の差異を吸収してファイルパスを解決する VFS リゾルバー（Linux/Android対応）
pub fn resolve_vfs_path(base_dir: &Path, relative_path: &str) -> Option<PathBuf> {
    let norm = normalize_vfs_path(relative_path);
    let path_str = if norm.is_empty() {
        relative_path
    } else {
        &norm
    };

    let mut current = base_dir.to_path_buf();

    // 高速パス: base_dir + path_str で直接ファイルまたはディレクトリが存在する場合
    let direct_combined = base_dir.join(path_str);
    if direct_combined.exists() {
        return Some(direct_combined);
    }

    for part in path_str.split(['/', '\\']) {
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
