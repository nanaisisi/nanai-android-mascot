/// さくらスクリプトの内部コマンド列挙
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SakuraCommand {
    Target(u8),                           // \0, \1, \p[n]
    Surface(u32),                         // \s[0], \s0
    Wait(u32),                            // \w1..9, \_w[ms] (ミリ秒単位)
    ClickWait,                            // \x (クリック/入力待ち)
    Quick(bool),                          // \_q (高速表示トグル)
    NewLine,                              // \n
    Clear,                                // \c
    Choice { label: String, id: String }, // \q[label,id]
    Anchor { id: String, text: String },  // \_a[id]text\_a
    Raise { event: String, references: Vec<String> }, // \![raise,Event,...]
    Bind { category: String, part: String, status: Option<bool> }, // \![bind,cat,part,status]
    Text(String),                         // 通常テキスト
    End,                                  // \e
}

/// さくらスクリプトのパーサと実行（内部コマンド）
pub fn execute_sakura_script(script: &str, mut callback: impl FnMut(SakuraCommand)) {
    let mut chars = script.chars().peekable();
    let mut buffer = String::new();
    while let Some(c) = chars.next() {
        if c == '\\' {
            if !buffer.is_empty() {
                callback(SakuraCommand::Text(buffer.clone()));
                buffer.clear();
            }
            match chars.next() {
                Some('0') => callback(SakuraCommand::Target(0)),
                Some('1') => callback(SakuraCommand::Target(1)),
                Some('p') => {
                    // \p[N]
                    if chars.peek() == Some(&'[') {
                        chars.next();
                        let mut num = String::new();
                        while let Some(&nc) = chars.peek() {
                            if nc == ']' {
                                chars.next();
                                break;
                            }
                            num.push(nc);
                            chars.next();
                        }
                        if let Ok(n) = num.parse() {
                            callback(SakuraCommand::Target(n));
                        }
                    }
                }
                Some('s') => {
                    // \s[N] または \s0..\s9
                    if chars.peek() == Some(&'[') {
                        chars.next();
                        let mut num = String::new();
                        while let Some(&nc) = chars.peek() {
                            if nc == ']' {
                                chars.next();
                                break;
                            }
                            num.push(nc);
                            chars.next();
                        }
                        if let Ok(n) = num.parse() {
                            callback(SakuraCommand::Surface(n));
                        }
                    } else if let Some(&nc) = chars.peek()
                        && nc.is_ascii_digit()
                    {
                        chars.next();
                        if let Some(digit) = nc.to_digit(10) {
                            callback(SakuraCommand::Surface(digit));
                        }
                    }
                }
                Some('w') => {
                    // \w1..\w9
                    if let Some(&nc) = chars.peek()
                        && nc.is_ascii_digit()
                    {
                        chars.next();
                        if let Some(digit) = nc.to_digit(10) {
                            callback(SakuraCommand::Wait(digit * 50));
                        }
                    }
                }
                Some('x') => callback(SakuraCommand::ClickWait),
                Some('_') => {
                    match chars.next() {
                        Some('w') => {
                            // \_w[N]
                            if chars.peek() == Some(&'[') {
                                chars.next();
                                let mut num = String::new();
                                while let Some(&nc) = chars.peek() {
                                    if nc == ']' {
                                        chars.next();
                                        break;
                                    }
                                    num.push(nc);
                                    chars.next();
                                }
                                if let Ok(ms) = num.parse() {
                                    callback(SakuraCommand::Wait(ms));
                                }
                            }
                        }
                        Some('q') => {
                            // \_q トグル
                            callback(SakuraCommand::Quick(true));
                        }
                        Some('a') => {
                            // \_a[id] または \_a (終了)
                            if chars.peek() == Some(&'[') {
                                chars.next();
                                let mut anchor_id = String::new();
                                while let Some(&nc) = chars.peek() {
                                    if nc == ']' {
                                        chars.next();
                                        break;
                                    }
                                    anchor_id.push(nc);
                                    chars.next();
                                }
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
                                callback(SakuraCommand::Anchor {
                                    id: anchor_id,
                                    text: anchor_text,
                                });
                            }
                        }
                        _ => {}
                    }
                }
                Some('!') => {
                    // \![raise,Event,...] または \![bind,category,part,status]
                    if chars.peek() == Some(&'[') {
                        chars.next();
                        let mut cmd_str = String::new();
                        while let Some(&nc) = chars.peek() {
                            if nc == ']' {
                                chars.next();
                                break;
                            }
                            cmd_str.push(nc);
                            chars.next();
                        }
                        let parts: Vec<&str> = cmd_str.split(',').map(|s| s.trim()).collect();
                        if !parts.is_empty() {
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
                    }
                }
                Some('n') => callback(SakuraCommand::NewLine),
                Some('c') => callback(SakuraCommand::Clear),
                Some('e') => callback(SakuraCommand::End),
                Some('q') => {
                    // \q[テキスト,ID]
                    if chars.peek() == Some(&'[') {
                        chars.next();
                        let mut content = String::new();
                        while let Some(&nc) = chars.peek() {
                            if nc == ']' {
                                chars.next();
                                break;
                            }
                            content.push(nc);
                            chars.next();
                        }
                        let mut parts = content.splitn(2, ',');
                        let label = parts.next().unwrap_or("").to_string();
                        let id = parts.next().unwrap_or("").to_string();
                        callback(SakuraCommand::Choice { label, id });
                    }
                }
                Some(_) | None => {}
            }
        } else {
            buffer.push(c);
        }
    }
    if !buffer.is_empty() {
        callback(SakuraCommand::Text(buffer));
    }
}
