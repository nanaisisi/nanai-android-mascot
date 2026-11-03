use super::super::super::SakuraCommand;
use super::super::utils::{CharsIter, consume_tag_tail, read_bracketed};

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
            // \_? raw text mode toggle: read raw text until matching \_?
            let mut raw_text = String::new();
            let mut closed = false;
            while let Some(rc) = chars.next() {
                if rc == '\\' && chars.peek() == Some(&'_') {
                    // Peek ahead for \_?
                    chars.next(); // consume '_'
                    if chars.peek() == Some(&'?') {
                        chars.next(); // consume '?'
                        closed = true;
                        break;
                    } else {
                        raw_text.push('\\');
                        raw_text.push('_');
                        continue;
                    }
                }
                raw_text.push(rc);
            }
            if !raw_text.is_empty() {
                callback(SakuraCommand::Text(raw_text));
            }
            if closed {
                callback(SakuraCommand::AutoPause);
            }
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
        Some('m') => {
            // \_m[hex] MIDI/sound command
            if let Some(data) = read_bracketed(chars) {
                callback(SakuraCommand::Midi(data));
            }
        }
        Some('u') => {
            // \_u[0x0000] Unicode character insert
            if let Some(hex_or_dec) = read_bracketed(chars) {
                let s = hex_or_dec.trim();
                let code = if s.starts_with("0x") || s.starts_with("0X") {
                    u32::from_str_radix(&s[2..], 16).ok()
                } else {
                    s.parse::<u32>().ok()
                };
                if let Some(c) = code.and_then(char::from_u32) {
                    callback(SakuraCommand::Text(c.to_string()));
                }
            }
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
            // \__v, \__q, \__c, \__t, \_+
            match chars.next() {
                Some('c') => {
                    // \__c open communicatebox
                    callback(SakuraCommand::OpenDialog {
                        dialog_type: "communicatebox".to_string(),
                        id: "".to_string(),
                        args: Vec::new(),
                    });
                }
                Some('t') => {
                    // \__t open teachbox
                    callback(SakuraCommand::OpenDialog {
                        dialog_type: "teachbox".to_string(),
                        id: "".to_string(),
                        args: Vec::new(),
                    });
                }
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_underscore_handlers_edge_cases() {
        let run = |script: &str| {
            let mut commands = Vec::new();
            let mut cb = |cmd| commands.push(cmd);
            let mut chars = script.chars().peekable();
            handle_underscore(&mut chars, &mut cb);
            commands
        };

        assert!(run("w[invalid]").is_empty());
        assert!(!run("w[100]").is_empty());

        assert!(!run("q[0]").is_empty());
        assert!(!run("q[1]").is_empty());
        assert!(!run("q").is_empty());

        assert!(!run("?hello\\_?").is_empty());
        assert!(!run("?unclosed").is_empty());
        assert!(!run("?hello\\_x").is_empty());

        assert!(!run("n").is_empty());
        assert!(!run("!").is_empty());

        assert!(!run("b[img.png, inline, 50, 60, opaque]").is_empty());

        assert!(!run("a[id1, arg1]AnchorText\\_a").is_empty());

        assert!(!run("s[false]").is_empty());
        assert!(!run("s").is_empty());

        assert!(!run("m[data]").is_empty());

        assert!(!run("u[0x41]").is_empty());
        assert!(!run("u[65]").is_empty());
        assert!(run("u[invalid]").is_empty());

        assert!(!run("l[10, 20]").is_empty());

        assert!(!run("_c").is_empty());
        assert!(!run("_t").is_empty());
        assert!(!run("_v[opt]").is_empty());
        assert!(!run("_q[0]").is_empty());
        assert!(!run("_q").is_empty());
        assert!(!run("_+").is_empty());
        assert!(run("_unknown").is_empty());

        assert!(run("z").is_empty());
    }
}
