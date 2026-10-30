//! さくらスクリプト括弧コマンドハンドラー

use super::super::SakuraCommand;
use super::utils::{consume_tag_tail, read_bracketed, read_digit, CharsIter};

pub(crate) fn handle_target_p(chars: &mut CharsIter<'_>) -> Option<u8> {
    if let Some(bracketed) = read_bracketed(chars) {
        bracketed.trim().parse().ok()
    } else {
        read_digit(chars).map(|d| d as u8)
    }
}

pub(crate) fn handle_surface(chars: &mut CharsIter<'_>) -> Option<u32> {
    if let Some(num) = read_bracketed(chars) {
        num.parse().ok()
    } else {
        read_digit(chars)
    }
}

pub(crate) fn handle_wait_short(chars: &mut CharsIter<'_>) -> Option<u32> {
    read_digit(chars).map(|d| d * 50)
}

pub(crate) fn handle_newline(chars: &mut CharsIter<'_>) -> Option<bool> {
    let arg = read_bracketed(chars);
    Some(matches!(arg.as_deref(), Some("half")))
}

pub(crate) fn handle_animation(chars: &mut CharsIter<'_>) -> Option<(u32, bool)> {
    let content = match read_bracketed(chars) {
        Some(c) => c,
        None => {
            return read_digit(chars).map(|d| (d, false));
        }
    };
    let mut parts = content.split(',');
    let id_raw = parts.next().unwrap_or("").trim();
    if id_raw.is_empty() {
        return None;
    }
    let id: u32 = id_raw.parse().ok()?;
    let wait = parts.next().is_some_and(|p| p.trim() == "wait");
    Some((id, wait))
}

pub(crate) fn handle_balloon(chars: &mut CharsIter<'_>) -> Option<i32> {
    if let Some(num) = read_bracketed(chars) {
        num.trim().parse().ok()
    } else {
        read_digit(chars).map(|d| d as i32)
    }
}

pub(crate) fn handle_font(chars: &mut CharsIter<'_>) -> Option<(String, Option<String>)> {
    let content = read_bracketed(chars)?;
    let mut parts = content.splitn(2, ',');
    let tag = parts.next().unwrap_or("").trim().to_string();
    let param = parts.next().map(|p| p.trim().to_string());
    Some((tag, param))
}

pub(crate) fn handle_raiselike(chars: &mut CharsIter<'_>, callback: &mut dyn FnMut(SakuraCommand)) {
    let Some(cmd_str) = read_bracketed(chars) else {
        return;
    };
    let parts: Vec<&str> = cmd_str.split(',').map(|s| s.trim()).collect();
    match parts[0] {
        "raise" => {
            let event = parts.get(1).unwrap_or(&"").to_string();
            let refs = if parts.len() > 2 {
                parts[2..].iter().map(|s| s.to_string()).collect()
            } else {
                Vec::new()
            };
            callback(SakuraCommand::Raise {
                event,
                references: refs,
            });
        }
        "execute" => {
            if parts.get(1).is_some_and(|p| *p == "schedule-add") {
                let date = parts.get(2).unwrap_or(&"Today").to_string();
                let time = parts.get(3).unwrap_or(&"12:00").to_string();
                let title = parts.get(4).unwrap_or(&"スケジュール").to_string();
                let memo = parts.get(5).unwrap_or(&"").to_string();
                callback(SakuraCommand::ScheduleAdd {
                    date,
                    time,
                    title,
                    memo,
                });
            } else {
                callback(SakuraCommand::Command {
                    args: parts.iter().map(|s| s.to_string()).collect(),
                });
            }
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
        _ => {
            callback(SakuraCommand::Command {
                args: parts.iter().map(|s| s.to_string()).collect(),
            });
        }
    }
}

pub(crate) fn handle_choice(chars: &mut CharsIter<'_>) -> Option<(String, String)> {
    let content = read_bracketed(chars)?;
    let parts: Vec<&str> = content.split(',').map(|s| s.trim()).collect();
    if parts.len() >= 3 && parts[0] == "temp" {
        let label = parts[1].to_string();
        let id = parts[2].to_string();
        return Some((label, id));
    }
    let label = parts.first().copied().unwrap_or("").to_string();
    let id = parts.get(1).copied().unwrap_or("").to_string();
    Some((label, id))
}

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
        Some('a') => {
            if let Some(anchor_id) = read_bracketed(chars) {
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
            let _ = chars.next();
            consume_tag_tail(chars);
        }
        _ => {
            consume_tag_tail(chars);
        }
    }
}
