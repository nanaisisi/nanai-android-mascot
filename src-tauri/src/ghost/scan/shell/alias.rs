//! シェル用 `alias.txt` の読み込み・パース

use std::collections::HashMap;
use std::path::Path;

/// `alias.txt` から読み込んだサーフィスエイリアス定義
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct ShellAliasTable {
    /// `sakura.surface.alias` セクション（エイリアス名/ID -> サーフィスID列）
    pub sakura: HashMap<String, Vec<u32>>,
    /// `kero.surface.alias` セクション（エイリアス名/ID -> サーフィスID列）
    pub kero: HashMap<String, Vec<u32>>,
    /// `char<N>.surface.alias` セクション（キャラクタID -> (エイリアス名/ID -> サーフィスID列)）
    pub chars: HashMap<u32, HashMap<String, Vec<u32>>>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum AliasSection {
    Sakura,
    Kero,
    Char(u32),
}

fn parse_section_header(line: &str) -> Option<AliasSection> {
    let header = line.trim_end_matches('{').trim().to_ascii_lowercase();
    match header.as_str() {
        "sakura.surface.alias" | "sakura.alias" => Some(AliasSection::Sakura),
        "kero.surface.alias" | "kero.alias" => Some(AliasSection::Kero),
        _ => {
            let rest = header
                .strip_prefix("char")?
                .strip_suffix(".surface.alias")
                .or_else(|| header.strip_prefix("char")?.strip_suffix(".alias"))?;
            let char_id = rest.parse::<u32>().ok()?;
            Some(AliasSection::Char(char_id))
        }
    }
}

fn parse_alias_entry(line: &str) -> Option<(String, Vec<u32>)> {
    let (key, raw_values) = line.split_once(',')?;
    let key = key.trim();
    if key.is_empty() {
        return None;
    }

    let cleaned = raw_values
        .trim()
        .trim_start_matches('[')
        .trim_end_matches(']');
    let ids: Vec<u32> = cleaned
        .split(',')
        .filter_map(|part| part.trim().parse::<u32>().ok())
        .collect();
    if ids.is_empty() {
        return None;
    }

    Some((key.to_string(), ids))
}

/// `alias.txt` のテキスト内容をパースする
pub fn parse_alias_txt(content: &str) -> ShellAliasTable {
    let mut table = ShellAliasTable::default();
    let mut current_section: Option<AliasSection> = None;
    let mut pending_section: Option<AliasSection> = None;

    for raw_line in content.lines() {
        let line = raw_line.trim();
        if line.is_empty() || line.starts_with("//") || line.starts_with('#') {
            continue;
        }

        if line == "{" {
            if let Some(sec) = pending_section.take() {
                current_section = Some(sec);
            }
            continue;
        }

        if line == "}" {
            current_section = None;
            pending_section = None;
            continue;
        }

        if current_section.is_none() {
            if let Some(sec) = parse_section_header(line) {
                if line.ends_with('{') {
                    current_section = Some(sec);
                    pending_section = None;
                } else {
                    pending_section = Some(sec);
                }
            }
            continue;
        }

        if let Some((alias_key, ids)) = parse_alias_entry(line) {
            match current_section {
                Some(AliasSection::Sakura) => {
                    table.sakura.insert(alias_key, ids);
                }
                Some(AliasSection::Kero) => {
                    table.kero.insert(alias_key, ids);
                }
                Some(AliasSection::Char(char_id)) => {
                    table
                        .chars
                        .entry(char_id)
                        .or_default()
                        .insert(alias_key, ids);
                }
                None => {}
            }
        }
    }

    table
}

/// 指定パスの `alias.txt` を読み込んでパースする（Shift_JIS / UTF-8 両対応）
pub fn read_alias_file(file_path: &Path) -> Option<ShellAliasTable> {
    if !file_path.exists() {
        return None;
    }
    let bytes = std::fs::read(file_path).ok()?;
    let text = if let Ok(utf8_str) = std::str::from_utf8(&bytes) {
        let lower = utf8_str.to_ascii_lowercase();
        if lower.contains("charset,shift_jis") || lower.contains("charset,sjis") {
            let (sjis_decoded, _, _) = encoding_rs::SHIFT_JIS.decode(&bytes);
            sjis_decoded.into_owned()
        } else {
            utf8_str.to_string()
        }
    } else {
        let (sjis_decoded, _, _) = encoding_rs::SHIFT_JIS.decode(&bytes);
        sjis_decoded.into_owned()
    };

    Some(parse_alias_txt(&text))
}

/// シェルディレクトリ配下の `alias.txt` を読み込む
pub fn read_shell_alias_txt(shell_dir: &Path) -> Option<ShellAliasTable> {
    read_alias_file(&shell_dir.join("alias.txt"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_alias_txt_supports_sakura_kero_and_char_sections() {
        let input = r#"
// comment
charset,UTF-8

sakura.surface.alias
{
    1000,0,1,2
    smile,[5,6]
}

kero.surface.alias {
    2000,10
}

char2.surface.alias
{
    idle,20,21
}
"#;
        let parsed = parse_alias_txt(input);
        assert_eq!(parsed.sakura.get("1000"), Some(&vec![0, 1, 2]));
        assert_eq!(parsed.sakura.get("smile"), Some(&vec![5, 6]));
        assert_eq!(parsed.kero.get("2000"), Some(&vec![10]));
        assert_eq!(
            parsed.chars.get(&2).and_then(|m| m.get("idle")),
            Some(&vec![20, 21])
        );
    }

    #[test]
    fn parse_alias_txt_ignores_invalid_entries() {
        let input = r#"
sakura.surface.alias
{
    ,1,2
    empty_ids,
    non_numeric,abc
    valid,7
}
"#;
        let parsed = parse_alias_txt(input);
        assert_eq!(parsed.sakura.len(), 1);
        assert_eq!(parsed.sakura.get("valid"), Some(&vec![7]));
    }
}
