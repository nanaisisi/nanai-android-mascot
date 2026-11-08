//! さくらスクリプト文字列の展開および逐次解釈（実行）ループ実装モジュール

use crate::script::command::SakuraCommand;
use crate::script::env::expand_sakura_script_env;
use crate::script::parser::brackets;
use crate::script::parser::brackets::handlers::handle_wait_short;

/// さくらスクリプトのパーサと実行（内部コマンド）
pub fn execute_sakura_script(script: &str, mut callback: impl FnMut(SakuraCommand)) {
    let expanded = expand_sakura_script_env(script, "User", "Nanai", "Kero");
    let mut chars = expanded.chars().peekable();
    let mut buffer = String::new();
    while let Some(c) = chars.next() {
        if c == '\\' {
            // Check for escaped backslash: \\
            if chars.peek() == Some(&'\\') {
                chars.next();
                buffer.push('\\');
                continue;
            }
            if !buffer.is_empty() {
                callback(SakuraCommand::Text(buffer.clone()));
                buffer.clear();
            }
            match chars.next() {
                // \0, \1, \2, \3, \4, \5, \6, \7, \8, \9 target scope tags (\0..\9, \h, \u)
                Some('0') | Some('h') => callback(SakuraCommand::Target(0)),
                Some('1') | Some('u') => callback(SakuraCommand::Target(1)),
                Some(c @ '2'..='9') => {
                    callback(SakuraCommand::Target(c.to_digit(10).unwrap() as u8))
                }
                Some('p') => {
                    // \p[N]
                    if let Some(n) = brackets::handle_target_p(&mut chars) {
                        callback(SakuraCommand::Target(n));
                    }
                }
                Some('s') => {
                    // \s[N] または \s0..\s9
                    if let Some(n) = brackets::handle_surface(&mut chars) {
                        callback(SakuraCommand::Surface(n));
                    }
                }
                Some('w') => {
                    // \w1..\w9
                    if let Some(ms) = handle_wait_short(&mut chars) {
                        callback(SakuraCommand::Wait(ms));
                    }
                }
                Some('x') => {
                    // \x または \x[noclear]
                    let _ = brackets::read_bracketed(&mut chars);
                    callback(SakuraCommand::ClickWait);
                }
                Some('_') => {
                    // \_w / \_q / \_a / \_s / \_l / \_! / \_\_v / \_\_q
                    brackets::handle_underscore(&mut chars, &mut callback);
                }
                Some('b') => {
                    // \b[n] または \b0..\b9（\b[-1] 等の負数含む）
                    if let Some(n) = brackets::handle_balloon(&mut chars) {
                        callback(SakuraCommand::Balloon(n));
                    }
                }
                Some('f') => {
                    // \f[tag,param] または \f[tag]
                    if let Some((tag, param)) = brackets::handle_font(&mut chars) {
                        callback(SakuraCommand::Font { tag, param });
                    }
                }
                Some('t') => callback(SakuraCommand::Timeout),
                Some('-') => callback(SakuraCommand::Halt),
                Some('!') => {
                    // \![raise,Event,...] または \![bind,category,part,status]
                    brackets::handle_raiselike(&mut chars, &mut callback);
                }
                Some('n') => {
                    // \n / \n[half] / \n[N]
                    let half = brackets::handle_newline(&mut chars).unwrap_or(false);
                    callback(SakuraCommand::NewLine { half });
                }
                Some('i') => {
                    // \i[ID] / \i[ID,wait] / \i0..\i9
                    if let Some((id, wait)) = brackets::handle_animation(&mut chars) {
                        callback(SakuraCommand::Animation { id, wait });
                    }
                }
                Some('c') => {
                    if let Some(arg) = brackets::read_bracketed(&mut chars) {
                        callback(SakuraCommand::ClearArg { arg });
                    } else {
                        callback(SakuraCommand::Clear)
                    }
                }
                Some('C') => callback(SakuraCommand::Clear),
                Some('e') => callback(SakuraCommand::End), // \e
                Some('m') => {
                    // \m[umsg,wparam,lparam] (m-umsg-wparam-lparam.md)
                    if let Some((umsg, wparam, lparam)) = brackets::handle_postmessage(&mut chars) {
                        callback(SakuraCommand::PostMessage {
                            umsg,
                            wparam,
                            lparam,
                        });
                    }
                }
                Some('q') => {
                    // \q[テキスト,ID] / \q[temp,テキスト,ID]
                    if let Some((label, id, args)) = brackets::handle_choice(&mut chars) {
                        callback(SakuraCommand::Choice { label, id, args });
                    }
                }
                Some('*') => callback(SakuraCommand::Star), // \*
                Some('z') => callback(SakuraCommand::Z),    // \z
                Some('a') => callback(SakuraCommand::AudioWait), // \a
                Some('v') => callback(SakuraCommand::Voice("".into())), // \v
                Some('j') => {
                    // \j[ID] / \j[URL] jump
                    if let Some(target) = brackets::read_bracketed(&mut chars) {
                        callback(SakuraCommand::Jump(target));
                    }
                }
                Some('+') => callback(SakuraCommand::Plus), // \+
                Some('&') => {
                    // \&[ID] entity / property interpolation (\&[amp], \&[lt], \&[gt], \&[quot], \&[ID])
                    if let Some(id) = brackets::read_bracketed(&mut chars) {
                        let text = match id.as_str() {
                            "amp" => "&".to_string(),
                            "lt" => "<".to_string(),
                            "gt" => ">".to_string(),
                            "quot" => "\"".to_string(),
                            "apos" => "'".to_string(),
                            "nbsp" => " ".to_string(),
                            other => format!("&[{}]", other),
                        };
                        callback(SakuraCommand::Text(text));
                    }
                }
                // 未知タグ: 後続の [...] 引数を消費し、本文への漏出を防ぐ
                Some(_) => brackets::consume_tag_tail(&mut chars),
                None => {}
            }
        } else {
            buffer.push(c);
        }
    }
    if !buffer.is_empty() {
        callback(SakuraCommand::Text(buffer));
    }
}
