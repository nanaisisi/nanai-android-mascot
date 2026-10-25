/// さくらスクリプトの内部コマンド列挙
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SakuraCommand {
    Target(u8),                           // \0, \1, \p[n]
    Surface(u32),                         // \s[0], \s0
    Wait(u32),                            // \w1..9, \_w[ms] (ミリ秒単位)
    NewLine,                              // \n
    Clear,                                // \c
    Choice { label: String, id: String }, // \q[label,id]
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
                Some('_') => {
                    // \_w[N]
                    if chars.peek() == Some(&'w') {
                        chars.next();
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
