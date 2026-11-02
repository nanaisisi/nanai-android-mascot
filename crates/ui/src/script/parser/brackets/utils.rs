//! さくらスクリプト括弧解析用ユーティリティ

use std::iter::Peekable;
use std::str::Chars;

pub(crate) type CharsIter<'a> = Peekable<Chars<'a>>;

/// 直後が `[` ならその中身を読む（']' で終端、`\]` はエスケープ）
pub(crate) fn read_bracketed(chars: &mut CharsIter<'_>) -> Option<String> {
    if chars.peek() != Some(&'[') {
        return None;
    }
    chars.next(); // '[' を消費
    let mut out = String::new();
    while let Some(c) = chars.next() {
        if c == '\\' {
            if chars.peek() == Some(&']') {
                chars.next();
                out.push(']');
                continue;
            }
            out.push('\\');
            continue;
        }
        if c == ']' {
            break;
        }
        out.push(c);
    }
    Some(out)
}

/// 括弧内の引数文字列をカンマ区切りで分割する。
/// UKADOC [notes_escape.md]:
/// - ダブルクォート `"` で囲まれた区間では、カンマ `,` は区切り文字とみなされない。
/// - クォート内の `""` は単一の `"` としてエスケープ解決される。
/// - 引数前後の空白および外側クォートはトリムされる。
pub(crate) fn split_bracket_args(content: &str) -> Vec<String> {
    let mut args = Vec::new();
    let mut current = String::new();
    let mut in_quotes = false;
    let mut chars = content.chars().peekable();

    while let Some(c) = chars.next() {
        if c == '"' {
            if in_quotes {
                if chars.peek() == Some(&'"') {
                    chars.next();
                    current.push('"');
                } else {
                    in_quotes = false;
                }
            } else {
                in_quotes = true;
            }
        } else if c == ',' && !in_quotes {
            args.push(current.trim().to_string());
            current.clear();
        } else {
            current.push(c);
        }
    }
    args.push(current.trim().to_string());
    args
}

/// 直後の ASCII 数字 1 桁を読む
pub(crate) fn read_digit(chars: &mut CharsIter<'_>) -> Option<u32> {
    let &nc = chars.peek()?;
    if nc.is_ascii_digit() {
        chars.next();
        nc.to_digit(10)
    } else {
        None
    }
}

/// 未知タグの後続引数を消費する
pub(crate) fn consume_tag_tail(chars: &mut CharsIter<'_>) {
    let _ = read_bracketed(chars);
}
