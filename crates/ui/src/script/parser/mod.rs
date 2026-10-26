//! さくらスクリプトのパーサと実行（内部コマンド）

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
                Some('0') => callback(SakuraCommand::Target(0)),
                Some('1') => callback(SakuraCommand::Target(1)),
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
                    if let Some(ms) = brackets::handle_wait_short(&mut chars) {
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
                Some('n') => callback(SakuraCommand::NewLine),
                Some('c') => callback(SakuraCommand::Clear),
                Some('e') => callback(SakuraCommand::End),
                Some('q') => {
                    // \q[テキスト,ID]
                    if let Some((label, id)) = brackets::handle_choice(&mut chars) {
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
