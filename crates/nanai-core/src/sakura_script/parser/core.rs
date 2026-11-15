//! さくらスクリプト メインパース処理

use super::standard_tags::parse_backslash_sequence;
use crate::sakura_script::types::SakuraToken;

/// さくらスクリプト文字列をトークン配列へ高速パース
pub fn parse_sakura_script(script: &str) -> Vec<SakuraToken> {
    let mut tokens = Vec::new();
    let mut chars = script.chars().peekable();
    let mut text_buf = String::new();
    let mut raw_mode_delimiter: Option<String> = None;

    while let Some(&ch) = chars.peek() {
        if let Some(ref delim) = raw_mode_delimiter {
            let delim_str = format!("\\{}", delim);
            let remaining: String = chars.clone().collect();
            if remaining.starts_with(&delim_str) {
                if !text_buf.is_empty() {
                    tokens.push(SakuraToken::Text(std::mem::take(&mut text_buf)));
                }
                for _ in 0..delim_str.chars().count() {
                    chars.next();
                }
                tokens.push(SakuraToken::RawToggle {
                    active: false,
                    delimiter: delim.clone(),
                });
                raw_mode_delimiter = None;
            } else {
                text_buf.push(chars.next().unwrap());
            }
            continue;
        }

        if ch == '\\' {
            chars.next(); // consume '\'
            if !text_buf.is_empty() {
                tokens.push(SakuraToken::Text(std::mem::take(&mut text_buf)));
            }
            parse_backslash_sequence(
                &mut chars,
                &mut text_buf,
                &mut tokens,
                &mut raw_mode_delimiter,
            );
        } else {
            text_buf.push(chars.next().unwrap());
        }
    }

    if !text_buf.is_empty() {
        tokens.push(SakuraToken::Text(text_buf));
    }

    tokens
}
