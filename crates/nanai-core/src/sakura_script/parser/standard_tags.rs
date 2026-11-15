//! 標準さくらスクリプトタグ (\0, \1, \s, \b, \i, \w, \p, \q, \f, \!, \&) パース処理

use super::extended_tags::{Parse_extended_tagParams, parse_extended_tag};
use super::helpers::{parse_bracket_arg, split_bracket_args};
use crate::sakura_script::types::SakuraToken;
use std::iter::Peekable;

#[allow(non_camel_case_types)]
pub struct Parse_backslash_sequenceParams<'a, 'b, I: Iterator<Item = char>> {
    pub(crate) chars: &'a mut Peekable<I>,
    pub(crate) text_buf: &'b mut String,
    pub(crate) tokens: &'b mut Vec<SakuraToken>,
    pub(crate) raw_mode_delimiter: &'b mut Option<String>,
}

impl<'a, 'b, I: Iterator<Item = char>> Parse_backslash_sequenceParams<'a, 'b, I> {
    pub fn new(
        chars: &'a mut Peekable<I>,
        text_buf: &'b mut String,
        tokens: &'b mut Vec<SakuraToken>,
        raw_mode_delimiter: &'b mut Option<String>,
    ) -> Self {
        Self {
            chars,
            text_buf,
            tokens,
            raw_mode_delimiter,
        }
    }

    pub fn into_parts(
        self,
    ) -> (
        &'a mut Peekable<I>,
        &'b mut String,
        &'b mut Vec<SakuraToken>,
        &'b mut Option<String>,
    ) {
        (
            self.chars,
            self.text_buf,
            self.tokens,
            self.raw_mode_delimiter,
        )
    }
}

pub fn parse_backslash_sequence<I: Iterator<Item = char>>(
    params: Parse_backslash_sequenceParams<'_, '_, I>,
) {
    let (chars, text_buf, tokens, raw_mode_delimiter) = params.into_parts();
    if let Some(&next_ch) = chars.peek() {
        match next_ch {
            '\\' | '%' => {
                let escaped = chars.next().unwrap();
                text_buf.push(escaped);
            }
            '&' => {
                chars.next();
                if let Some(arg) = parse_bracket_arg(chars) {
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
                if let Some(arg) = parse_bracket_arg(chars) {
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
                if let Some(arg) = parse_bracket_arg(chars) {
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
                if let Some(arg) = parse_bracket_arg(chars)
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
                if let Some(arg) = parse_bracket_arg(chars)
                    && let Ok(scope) = arg.parse::<u32>()
                {
                    tokens.push(SakuraToken::Scope(scope));
                }
            }
            'q' => {
                chars.next();
                if let Some(arg) = parse_bracket_arg(chars) {
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
                if let Some(arg) = parse_bracket_arg(chars) {
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
                if let Some(arg) = parse_bracket_arg(chars) {
                    let args = split_bracket_args(&arg);
                    let command = args.first().cloned().unwrap_or_default();
                    tokens.push(SakuraToken::Command { command, args });
                }
            }
            '_' => {
                chars.next(); // consume '_'
                parse_extended_tag(Parse_extended_tagParams::new(
                    chars,
                    text_buf,
                    tokens,
                    raw_mode_delimiter,
                ));
            }
            _ => {
                text_buf.push('\\');
            }
        }
    } else {
        text_buf.push('\\');
    }
}
