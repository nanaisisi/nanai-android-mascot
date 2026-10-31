use super::super::super::SakuraCommand;
use super::super::utils::{consume_tag_tail, read_bracketed, CharsIter};

pub(crate) fn handle_underscore(
    chars: &mut CharsIter<'_>,
    callback: &mut dyn FnMut(SakuraCommand),
) {
    match chars.next() {
        Some('w') => {
            if let Some(ms) = read_bracketed(chars).and_then(|s| s.parse().ok()) {
                callback(SakuraCommand::Wait(ms));
            }
        }
        Some('q') => {
            let enabled = if chars.peek() == Some(&'[') {
                read_bracketed(chars)
                    .map(|v| !matches!(v.trim(), "0" | "false"))
                    .unwrap_or(true)
            } else {
                true
            };
            callback(SakuraCommand::Quick(enabled));
        }
        Some('?') => {
            callback(SakuraCommand::AutoPause);
        }
        Some('n') => {
            callback(SakuraCommand::NewLineNoPause);
        }
        Some('!') => {
            callback(SakuraCommand::NoUserBreak(true));
        }
        Some('b') => {
            if let Some(content) = read_bracketed(chars) {
                let parts: Vec<&str> = content.split(',').map(|s| s.trim()).collect();
                let path = parts.first().copied().unwrap_or("").to_string();
                let mode = parts.get(1).copied().unwrap_or("inline").to_string();
                let mut x = None;
                let mut y = None;
                let mut opaque = false;
                for &p in parts.iter().skip(2) {
                    if p.eq_ignore_ascii_case("opaque") {
                        opaque = true;
                    } else if let Ok(val) = p.parse::<i32>() {
                        if x.is_none() {
                            x = Some(val);
                        } else if y.is_none() {
                            y = Some(val);
                        }
                    }
                }
                callback(SakuraCommand::InlineBitmap {
                    path,
                    mode,
                    x,
                    y,
                    opaque,
                });
            }
        }
        Some('a') => {
            if let Some(pos) = read_bracketed(chars) {
                let mut parts = pos.split(',').map(|s| s.trim());
                let anchor_id = parts.next().unwrap_or("").to_string();
                let args: Vec<String> = parts.map(|s| s.to_string()).collect();

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
                callback(SakuraCommand::Anchor {
                    id: anchor_id,
                    text: anchor_text,
                    args,
                });
            }
        }
        Some('s') => {
            let enabled = if chars.peek() == Some(&'[') {
                read_bracketed(chars)
                    .map(|v| !matches!(v.trim(), "0" | "false"))
                    .unwrap_or(true)
            } else {
                true
            };
            callback(SakuraCommand::Sync(enabled));
        }
        Some('l') => {
            if let Some(pos) = read_bracketed(chars) {
                let mut coords = pos.splitn(2, ',');
                let x = coords.next().unwrap_or("0").trim().to_string();
                let y = coords.next().unwrap_or("0").trim().to_string();
                callback(SakuraCommand::Offset { x, y });
            }
        }
        Some('_') => {
            // \__v, \__q, \_+
            match chars.next() {
                Some('v') => {
                    let opt = read_bracketed(chars).unwrap_or_default();
                    callback(SakuraCommand::Voice(opt));
                }
                Some('q') => {
                    // \__q[ID] quick choice mode
                    let enabled = if chars.peek() == Some(&'[') {
                        read_bracketed(chars)
                            .map(|v| !matches!(v.trim(), "0" | "false"))
                            .unwrap_or(true)
                    } else {
                        true
                    };
                    callback(SakuraCommand::Quick(enabled));
                }
                Some('+') => {
                    // \_+
                    callback(SakuraCommand::Plus);
                }
                _ => {
                    consume_tag_tail(chars);
                }
            }
        }
        _ => {
            consume_tag_tail(chars);
        }
    }
}
