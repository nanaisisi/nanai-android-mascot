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
