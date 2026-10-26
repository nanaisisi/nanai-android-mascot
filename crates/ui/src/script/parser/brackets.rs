//! さくらスクリプトの括弧コマンド（`\s[N]` / `\_w[N]` / `\![...]` 等）処理

use std::iter::Peekable;
use std::str::Chars;

use super::SakuraCommand;

type CharsIter<'a> = Peekable<Chars<'a>>;

/// 直後が `[` ならその中身を読む（']' で終端）
fn read_bracketed(chars: &mut CharsIter<'_>) -> Option<String> {
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
fn read_digit(chars: &mut CharsIter<'_>) -> Option<u32> {
    let &nc = chars.peek()?;
    if nc.is_ascii_digit() {
        chars.next();
        nc.to_digit(10)
    } else {
        None
    }
}

/// `\p[N]`
pub(super) fn handle_target_p(chars: &mut CharsIter<'_>) -> Option<u8> {
    read_bracketed(chars)?.parse().ok()
}

/// `\s[N]` または `\s0..\s9`
pub(super) fn handle_surface(chars: &mut CharsIter<'_>) -> Option<u32> {
    if let Some(num) = read_bracketed(chars) {
        num.parse().ok()
    } else {
        read_digit(chars)
    }
}

/// `\w1..\w9`（数字×50ms）
pub(super) fn handle_wait_short(chars: &mut CharsIter<'_>) -> Option<u32> {
    read_digit(chars).map(|d| d * 50)
}

/// `\b[n]`（\b[-1] 等の負数含む）または `\b0..\b9`
pub(super) fn handle_balloon(chars: &mut CharsIter<'_>) -> Option<i32> {
    if let Some(num) = read_bracketed(chars) {
        num.trim().parse().ok()
    } else {
        read_digit(chars).map(|d| d as i32)
    }
}

/// `\f[tag,param]` または `\f[tag]`
pub(super) fn handle_font(chars: &mut CharsIter<'_>) -> Option<(String, Option<String>)> {
    let content = read_bracketed(chars)?;
    let mut parts = content.splitn(2, ',');
    let tag = parts.next().unwrap_or("").trim().to_string();
    let param = parts.next().map(|p| p.trim().to_string());
    Some((tag, param))
}

/// `\![raise,Event,...]` または `\![bind,category,part,status]`
pub(super) fn handle_raiselike(
    chars: &mut CharsIter<'_>,
    callback: &mut dyn FnMut(SakuraCommand),
) {
    let Some(cmd_str) = read_bracketed(chars) else {
        return;
    };
    let parts: Vec<&str> = cmd_str.split(',').map(|s| s.trim()).collect();
    if parts.is_empty() {
        return;
    }
    match parts[0] {
        "raise" => {
            let event = parts.get(1).unwrap_or(&"").to_string();
            let refs = parts[2..].iter().map(|s| s.to_string()).collect();
            callback(SakuraCommand::Raise {
                event,
                references: refs,
            });
        }
        "bind" => {
            let category = parts.get(1).unwrap_or(&"").to_string();
            let part = parts.get(2).unwrap_or(&"").to_string();
            let status = parts.get(3).and_then(|v| match *v {
                "1" | "true" => Some(true),
                "0" | "false" => Some(false),
                _ => None,
            });
            callback(SakuraCommand::Bind {
                category,
                part,
                status,
            });
        }
        _ => {}
    }
}

/// `\q[テキスト,ID]`
pub(super) fn handle_choice(chars: &mut CharsIter<'_>) -> Option<(String, String)> {
    let content = read_bracketed(chars)?;
    let mut parts = content.splitn(2, ',');
    let label = parts.next().unwrap_or("").to_string();
    let id = parts.next().unwrap_or("").to_string();
    Some((label, id))
}

/// `\_` 系コマンド（\_w / \_q / \_a / \_s / \_l）の共通処理
pub(super) fn handle_underscore(
    chars: &mut CharsIter<'_>,
    callback: &mut dyn FnMut(SakuraCommand),
) {
    match chars.next() {
        Some('w') => {
            // \_w[N]
            if let Some(ms) = read_bracketed(chars).and_then(|s| s.parse().ok()) {
                callback(SakuraCommand::Wait(ms));
            }
        }
        Some('q') => {
            // \_q トグル
            callback(SakuraCommand::Quick(true));
        }
        Some('a') => {
            // \_a[id]text\_a
            if let Some(anchor_id) = read_bracketed(chars) {
                // \_a までテキストを蓄積
                let mut anchor_text = String::new();
                while let Some(ac) = chars.next() {
                    if ac == '\\' && chars.peek() == Some(&'_') {
                        chars.next();
                        if chars.peek() == Some(&'a') {
                            chars.next();
                            break;
                        }
                    }
                    anchor_text.push(ac);
                }
                callback(SakuraCommand::Anchor { id: anchor_id, text: anchor_text });
            }
        }
        Some('s') => {
            // \_s (複数キャラ同期表示トグル)
            callback(SakuraCommand::Sync(true));
        }
        Some('l') => {
            // \_l[x,y]
            if let Some(pos) = read_bracketed(chars) {
                let mut coords = pos.splitn(2, ',');
                let x = coords.next().unwrap_or("0").trim().to_string();
                let y = coords.next().unwrap_or("0").trim().to_string();
                callback(SakuraCommand::Offset { x, y });
            }
        }
        _ => {}
    }
}
