//! さくらスクリプト括弧解析用ユーティリティ

use std::iter::Peekable;
use std::str::Chars;

pub(crate) type CharsIter<'a> = Peekable<Chars<'a>>;

/// 直後が `[` ならその中身を読む（']' で終端）
pub(crate) fn read_bracketed(chars: &mut CharsIter<'_>) -> Option<String> {
    if chars.peek() != Some(&'[') {
        return None;
    }
    chars.next(); // '[' を消費
    let mut out = String::new();
    while let Some(&nc) = chars.peek() {
        if nc == ']' {
            chars.next();
            break;
        }
        out.push(nc);
        chars.next();
    }
    Some(out)
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
