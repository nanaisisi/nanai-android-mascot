use encoding_rs::SHIFT_JIS;
use std::fs::File;
use std::io::{self, Read};
use std::path::{Path, PathBuf};

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

/// さくらスクリプトのパーサと実行（内部コマンド）
pub fn execute_sakura_script(script: &str, mut callback: impl FnMut(SakuraCommand)) {
    let mut chars = script.chars().peekable();
    let mut buffer = String::new();
    while let Some(c) = chars.next() {
        if c == '\\' {
            if !buffer.is_empty() {
                callback(SakuraCommand::Text(buffer.clone()));
                buffer.clear();
            }
            match chars.next() {
                Some('0') => callback(SakuraCommand::Target(0)),
                Some('1') => callback(SakuraCommand::Target(1)),
                Some('p') => {
                    // \p[N]
                    if chars.peek() == Some(&'[') {
                        chars.next();
                        let mut num = String::new();
                        while let Some(&nc) = chars.peek() {
                            if nc == ']' {
                                chars.next();
                                break;
                            }
                            num.push(nc);
                            chars.next();
                        }
                        if let Ok(n) = num.parse() {
                            callback(SakuraCommand::Target(n));
                        }
                    }
                }
                Some('s') => {
                    // \s[N] または \s0..\s9
                    if chars.peek() == Some(&'[') {
                        chars.next();
                        let mut num = String::new();
                        while let Some(&nc) = chars.peek() {
                            if nc == ']' {
                                chars.next();
                                break;
                            }
                            num.push(nc);
                            chars.next();
                        }
                        if let Ok(n) = num.parse() {
                            callback(SakuraCommand::Surface(n));
                        }
                    } else if let Some(&nc) = chars.peek()
                        && nc.is_ascii_digit()
                    {
                        chars.next();
                        if let Some(digit) = nc.to_digit(10) {
                            callback(SakuraCommand::Surface(digit));
                        }
                    }
                }
                Some('w') => {
                    // \w1..\w9
                    if let Some(&nc) = chars.peek()
                        && nc.is_ascii_digit()
                    {
                        chars.next();
                        if let Some(digit) = nc.to_digit(10) {
                            callback(SakuraCommand::Wait(digit * 50));
                        }
                    }
                }
                Some('_') => {
                    // \_w[N]
                    if chars.peek() == Some(&'w') {
                        chars.next();
                        if chars.peek() == Some(&'[') {
                            chars.next();
                            let mut num = String::new();
                            while let Some(&nc) = chars.peek() {
                                if nc == ']' {
                                    chars.next();
                                    break;
                                }
                                num.push(nc);
                                chars.next();
                            }
                            if let Ok(ms) = num.parse() {
                                callback(SakuraCommand::Wait(ms));
                            }
                        }
                    }
                }
                Some('n') => callback(SakuraCommand::NewLine),
                Some('c') => callback(SakuraCommand::Clear),
                Some('e') => callback(SakuraCommand::End),
                Some('q') => {
                    // \q[テキスト,ID]
                    if chars.peek() == Some(&'[') {
                        chars.next();
                        let mut content = String::new();
                        while let Some(&nc) = chars.peek() {
                            if nc == ']' {
                                chars.next();
                                break;
                            }
                            content.push(nc);
                            chars.next();
                        }
                        let mut parts = content.splitn(2, ',');
                        let label = parts.next().unwrap_or("").to_string();
                        let id = parts.next().unwrap_or("").to_string();
                        callback(SakuraCommand::Choice { label, id });
                    }
                }
                Some(_) | None => {}
            }
        } else {
            buffer.push(c);
        }
    }
    if !buffer.is_empty() {
        callback(SakuraCommand::Text(buffer));
    }
}

/// さくらスクリプトの内部コマンド列挙
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SakuraCommand {
    Target(u8),                  // \0, \1, \p[n]
    Surface(u32),                // \s[0], \s0
    Wait(u32),                   // \w1..9, \_w[ms] (ミリ秒単位)
    NewLine,                     // \n
    Clear,                       // \c
    Choice { label: String, id: String }, // \q[label,id]
    Text(String),                // 通常テキスト
    End,                         // \e
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_open_shift_jis_file() {
        // このテストはサンプルファイルが存在する場合のみ実行される
        if let Ok(content) = open_shift_jis_file("sample/readme.txt") {
            assert!(!content.is_empty());
            println!("Content: {}", content);
        }
    }
}
