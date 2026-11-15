//! さくらスクリプト パース処理および WASM バインディング

use super::types::SakuraToken;
use wasm_bindgen::prelude::*;

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

            if let Some(&next_ch) = chars.peek() {
                match next_ch {
                    '\\' | '%' => {
                        let escaped = chars.next().unwrap();
                        text_buf.push(escaped);
                    }
                    '&' => {
                        chars.next();
                        if let Some(arg) = parse_bracket_arg(&mut chars) {
                            match arg.trim().to_lowercase().as_str() {
                                "amp" => text_buf.push('&'),
                                "lt" => text_buf.push('<'),
                                "gt" => text_buf.push('>'),
                                "quot" => text_buf.push('"'),
                                "apos" => text_buf.push('\''),
                                "nbsp" => text_buf.push(' '),
                                _ => {
                                    text_buf.push_str("&[");
                                    text_buf.push_str(&arg);
                                    text_buf.push(']');
                                }
                            }
                        }
                    }
                    '0' => {
                        chars.next();
                        tokens.push(SakuraToken::Scope(0));
                    }
                    '1' => {
                        chars.next();
                        tokens.push(SakuraToken::Scope(1));
                    }
                    'n' => {
                        chars.next();
                        tokens.push(SakuraToken::Newline);
                    }
                    'c' => {
                        chars.next();
                        tokens.push(SakuraToken::Clear);
                    }
                    'e' => {
                        chars.next();
                        tokens.push(SakuraToken::Halt);
                    }
                    's' => {
                        chars.next();
                        if let Some(arg) = parse_bracket_arg(&mut chars) {
                            if let Ok(id) = arg.parse::<i32>() {
                                tokens.push(SakuraToken::Surface(id));
                            }
                        } else if let Some(&digit) = chars.peek()
                            && digit.is_ascii_digit()
                        {
                            chars.next();
                            tokens.push(SakuraToken::Surface((digit as u8 - b'0') as i32));
                        }
                    }
                    'b' => {
                        chars.next();
                        if let Some(arg) = parse_bracket_arg(&mut chars) {
                            if let Ok(id) = arg.parse::<i32>() {
                                tokens.push(SakuraToken::Balloon(id));
                            }
                        } else if let Some(&digit) = chars.peek()
                            && digit.is_ascii_digit()
                        {
                            chars.next();
                            tokens.push(SakuraToken::Balloon((digit as u8 - b'0') as i32));
                        }
                    }
                    'i' => {
                        chars.next();
                        if let Some(arg) = parse_bracket_arg(&mut chars)
                            && let Ok(id) = arg.parse::<i32>()
                        {
                            tokens.push(SakuraToken::Animation(id));
                        }
                    }
                    'w' => {
                        chars.next();
                        if let Some(&digit) = chars.peek()
                            && digit.is_ascii_digit()
                        {
                            chars.next();
                            let wait_ms = ((digit as u8 - b'0') as u32) * 50;
                            tokens.push(SakuraToken::Wait(wait_ms));
                        }
                    }
                    'p' => {
                        chars.next();
                        if let Some(arg) = parse_bracket_arg(&mut chars)
                            && let Ok(scope) = arg.parse::<u32>()
                        {
                            tokens.push(SakuraToken::Scope(scope));
                        }
                    }
                    'q' => {
                        chars.next();
                        if let Some(arg) = parse_bracket_arg(&mut chars) {
                            let parts = split_bracket_args(&arg);
                            if parts.first().map(|s| s.as_str()) == Some("temp") {
                                let title = parts.get(1).cloned().unwrap_or_default();
                                let id = parts.get(2).cloned().unwrap_or_default();
                                let args = if parts.len() > 3 {
                                    parts[3..].to_vec()
                                } else {
                                    vec![]
                                };
                                tokens.push(SakuraToken::Choice { title, id, args });
                            } else {
                                let title = parts.first().cloned().unwrap_or_default();
                                let id = parts.get(1).cloned().unwrap_or_default();
                                let args = parts.into_iter().skip(2).collect();
                                tokens.push(SakuraToken::Choice { title, id, args });
                            }
                        }
                    }
                    'f' => {
                        chars.next();
                        if let Some(arg) = parse_bracket_arg(&mut chars) {
                            let parts = split_bracket_args(&arg);
                            let property = parts.first().cloned().unwrap_or_default();
                            let args = parts.into_iter().skip(1).collect();
                            tokens.push(SakuraToken::Font { property, args });
                        } else {
                            tokens.push(SakuraToken::Font {
                                property: "default".to_string(),
                                args: vec![],
                            });
                        }
                    }
                    '!' => {
                        chars.next();
                        if let Some(arg) = parse_bracket_arg(&mut chars) {
                            let args = split_bracket_args(&arg);
                            let command = args.first().cloned().unwrap_or_default();
                            tokens.push(SakuraToken::Command { command, args });
                        }
                    }
                    '_' => {
                        chars.next(); // consume '_'
                        if let Some(&tag_ch) = chars.peek() {
                            if tag_ch == 'w' {
                                chars.next();
                                if let Some(arg) = parse_bracket_arg(&mut chars)
                                    && let Ok(ms) = arg.parse::<u32>()
                                {
                                    if !text_buf.is_empty() {
                                        tokens
                                            .push(SakuraToken::Text(std::mem::take(&mut text_buf)));
                                    }
                                    tokens.push(SakuraToken::Wait(ms));
                                }
                            } else if tag_ch == '_' {
                                chars.next();
                                if chars.peek() == Some(&'q') {
                                    chars.next();
                                    if !text_buf.is_empty() {
                                        tokens
                                            .push(SakuraToken::Text(std::mem::take(&mut text_buf)));
                                    }
                                    if let Some(arg) = parse_bracket_arg(&mut chars) {
                                        let args: Vec<String> =
                                            arg.split(',').map(|s| s.trim().to_string()).collect();
                                        let id = args.first().cloned().unwrap_or_default();
                                        tokens.push(SakuraToken::ChoiceScopeBegin { id, args });
                                    } else {
                                        tokens.push(SakuraToken::ChoiceScopeEnd);
                                    }
                                } else {
                                    text_buf.push('\\');
                                    text_buf.push('_');
                                    text_buf.push('_');
                                }
                            } else if tag_ch == 'u' {
                                chars.next();
                                if let Some(arg) = parse_bracket_arg(&mut chars) {
                                    let raw = arg.trim();
                                    let code = if raw.starts_with("0x") || raw.starts_with("0X") {
                                        u32::from_str_radix(&raw[2..], 16)
                                    } else {
                                        raw.parse::<u32>()
                                    };
                                    if let Ok(c) = code
                                        && let Some(ch) = char::from_u32(c)
                                    {
                                        text_buf.push(ch);
                                    }
                                }
                            } else if tag_ch == 'm' {
                                chars.next();
                                if let Some(arg) = parse_bracket_arg(&mut chars) {
                                    let raw = arg.trim();
                                    let code = if raw.starts_with("0x") || raw.starts_with("0X") {
                                        u32::from_str_radix(&raw[2..], 16)
                                    } else {
                                        raw.parse::<u32>()
                                    };
                                    if let Ok(c) = code
                                        && c <= 0xff
                                        && let Some(ch) = char::from_u32(c)
                                    {
                                        text_buf.push(ch);
                                    }
                                }
                            } else if tag_ch == 's' {
                                chars.next();
                                tokens.push(SakuraToken::Sync(true));
                            } else if tag_ch == 'q' {
                                chars.next();
                                tokens.push(SakuraToken::Quick(true));
                            } else if tag_ch == 'n' {
                                chars.next();
                                tokens.push(SakuraToken::NoAutoWrap);
                            } else if tag_ch == '?' || tag_ch == '!' {
                                chars.next();
                                let delim = format!("_{}", tag_ch);
                                tokens.push(SakuraToken::RawToggle {
                                    active: true,
                                    delimiter: delim.clone(),
                                });
                                raw_mode_delimiter = Some(delim);
                            } else if tag_ch == 'a' {
                                chars.next(); // consume 'a'
                                if let Some(arg) = parse_bracket_arg(&mut chars) {
                                    let mut anchor_text = String::new();
                                    while let Some(&a_ch) = chars.peek() {
                                        if a_ch == '\\' {
                                            chars.next();
                                            if chars.peek() == Some(&'_') {
                                                chars.next();
                                                if chars.peek() == Some(&'a') {
                                                    chars.next();
                                                    break;
                                                }
                                                anchor_text.push('\\');
                                                anchor_text.push('_');
                                            } else {
                                                anchor_text.push('\\');
                                            }
                                        } else {
                                            anchor_text.push(chars.next().unwrap());
                                        }
                                    }
                                    tokens.push(SakuraToken::Anchor {
                                        id: arg,
                                        text: anchor_text,
                                    });
                                }
                            } else {
                                text_buf.push('\\');
                                text_buf.push('_');
                            }
                        }
                    }
                    _ => {
                        text_buf.push('\\');
                    }
                }
            } else {
                text_buf.push('\\');
            }
        } else {
            text_buf.push(chars.next().unwrap());
        }
    }

    if !text_buf.is_empty() {
        tokens.push(SakuraToken::Text(text_buf));
    }

    tokens
}

fn split_bracket_args(arg: &str) -> Vec<String> {
    let mut args = Vec::new();
    let mut current = String::new();
    let mut in_quote = false;
    let mut chars = arg.chars().peekable();

    while let Some(c) = chars.next() {
        if c == '"' {
            if in_quote && chars.peek() == Some(&'"') {
                current.push('"');
                chars.next();
            } else {
                in_quote = !in_quote;
            }
        } else if c == ',' && !in_quote {
            args.push(current.trim().to_string());
            current.clear();
        } else {
            current.push(c);
        }
    }
    args.push(current.trim().to_string());
    args
}

fn parse_bracket_arg<I: Iterator<Item = char>>(
    chars: &mut std::iter::Peekable<I>,
) -> Option<String> {
    if chars.peek() == Some(&'[') {
        chars.next(); // consume '['
        let mut arg = String::new();
        let mut in_quote = false;

        while let Some(&ch) = chars.peek() {
            if ch == '\\' {
                chars.next(); // consume '\'
                if let Some(&escaped) = chars.peek() {
                    if escaped == ']' || escaped == '\\' {
                        arg.push(chars.next().unwrap());
                    } else {
                        arg.push('\\');
                    }
                }
            } else if ch == '"' {
                in_quote = !in_quote;
                arg.push(chars.next().unwrap());
            } else if ch == ']' && !in_quote {
                chars.next(); // consume ']'
                return Some(arg);
            } else {
                arg.push(chars.next().unwrap());
            }
        }
        Some(arg)
    } else {
        None
    }
}

#[wasm_bindgen]
pub fn wasm_parse_sakura_script(script: &str) -> Result<JsValue, JsValue> {
    let tokens = parse_sakura_script(script);
    Ok(serde_wasm_bindgen::to_value(&tokens)?)
}
