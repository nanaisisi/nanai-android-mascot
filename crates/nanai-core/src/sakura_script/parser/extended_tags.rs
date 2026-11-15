//! 拡張さくらスクリプトタグ (\_w, \__q, \_u, \_m, \_s, \_q, \_n, \_?, \_!, \_a) パース処理

use super::helpers::parse_bracket_arg;
use crate::sakura_script::types::SakuraToken;
use std::iter::Peekable;

pub fn parse_extended_tag<I: Iterator<Item = char>>(
    chars: &mut Peekable<I>,
    text_buf: &mut String,
    tokens: &mut Vec<SakuraToken>,
    raw_mode_delimiter: &mut Option<String>,
) {
    if let Some(&tag_ch) = chars.peek() {
        match tag_ch {
            'w' => {
                chars.next();
                if let Some(arg) = parse_bracket_arg(chars)
                    && let Ok(ms) = arg.parse::<u32>()
                {
                    if !text_buf.is_empty() {
                        tokens.push(SakuraToken::Text(std::mem::take(text_buf)));
                    }
                    tokens.push(SakuraToken::Wait(ms));
                }
            }
            '_' => {
                chars.next();
                if chars.peek() == Some(&'q') {
                    chars.next();
                    if !text_buf.is_empty() {
                        tokens.push(SakuraToken::Text(std::mem::take(text_buf)));
                    }
                    if let Some(arg) = parse_bracket_arg(chars) {
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
            }
            'u' | 'm' => {
                chars.next();
                if let Some(arg) = parse_bracket_arg(chars) {
                    let raw = arg.trim();
                    let code = if raw.starts_with("0x") || raw.starts_with("0X") {
                        u32::from_str_radix(&raw[2..], 16)
                    } else {
                        raw.parse::<u32>()
                    };
                    if let Ok(c) = code {
                        let is_m = tag_ch == 'm';
                        if (!is_m || c <= 0xff) && let Some(ch) = char::from_u32(c) {
                            text_buf.push(ch);
                        }
                    }
                }
            }
            's' => {
                chars.next();
                tokens.push(SakuraToken::Sync(true));
            }
            'q' => {
                chars.next();
                tokens.push(SakuraToken::Quick(true));
            }
            'n' => {
                chars.next();
                tokens.push(SakuraToken::NoAutoWrap);
            }
            '?' | '!' => {
                chars.next();
                let delim = format!("_{}", tag_ch);
                tokens.push(SakuraToken::RawToggle {
                    active: true,
                    delimiter: delim.clone(),
                });
                *raw_mode_delimiter = Some(delim);
            }
            'a' => {
                chars.next();
                if let Some(arg) = parse_bracket_arg(chars) {
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
            }
            _ => {
                text_buf.push('\\');
                text_buf.push('_');
            }
        }
    }
}
