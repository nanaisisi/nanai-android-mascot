//! さくらスクリプトのパーサと実行（内部コマンド）

use crate::script::parser::brackets::handlers::handle_wait_short;

use super::command::SakuraCommand;

mod brackets;

/// さくらスクリプトをパースして SakuraCommand のリストとして返す
pub fn parse_sakura_script(script: &str) -> Vec<SakuraCommand> {
    let mut commands = Vec::new();
    execute_sakura_script(script, |cmd| commands.push(cmd));
    commands
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
                Some('0') | Some('h') => callback(SakuraCommand::Target(0)),
                Some('1') | Some('u') => callback(SakuraCommand::Target(1)),
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
                Some('x') => callback(SakuraCommand::ClickWait),
                Some('_') => {
                    // \_w / \_q / \_a / \_s / \_l
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
                Some('e') => callback(SakuraCommand::End),
                Some('q') => {
                    // \q[テキスト,ID] / \q[temp,テキスト,ID]
                    if let Some((label, id, args)) = brackets::handle_choice(&mut chars) {
                        callback(SakuraCommand::Choice { label, id, args });
                    }
                }
                Some('*') => callback(SakuraCommand::Star),
                Some('z') => callback(SakuraCommand::Z),
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_sakura_script() {
        let script = "\\0\\s[0]Hello\\w1\\e";
        let cmds = parse_sakura_script(script);
        assert!(!cmds.is_empty());
    }

    #[test]
    fn test_parse_sakura_script_comprehensive() {
        let script = "\\0\\h\\1\\u\\p[2]\\px\\s[10]\\sx\\w5\\wx\\x\\_w[10]\\b[1]\\bx\\f[bold,1]\\fx\\t\\-\\n\\i[3]\\ix\\c\\e\\q[Opt,ID]\\qx\\![raise,OnE]\\!unknown\\z[arg]\\";
        let cmds = parse_sakura_script(script);
        assert!(!cmds.is_empty());
    }
}
