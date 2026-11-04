//! さくらスクリプトのパーサと実行（内部コマンド）

use crate::script::env::expand_sakura_script_env;
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
                    // \f[tag,param] または \f[tag] (\f[name], \f[height], \f[color], \f[bold], \f[italic], \f[underline], \f[strike], \f[default], \f[outline], \f[shadowcolor], \f[align], \f[valign], \f[sub], \f[sup], \f[disable])
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_sakura_script() {
        let script = "\\0\\s[0]Hello %username\\w1\\e";
        let cmds = parse_sakura_script(script);
        assert!(!cmds.is_empty());
    }

    #[test]
    fn test_parse_sakura_script_comprehensive() {
        let script = "\\0\\h\\1\\u\\p[2]\\px\\s[10]\\sx\\w5\\wx\\x\\_w[10]\\b[1]\\bx\\f[bold,1]\\fx\\t\\-\\n\\i[3]\\ix\\c\\e\\q[Opt,ID]\\qx\\![raise,OnE]\\!unknown\\z[arg]\\";
        let cmds = parse_sakura_script(script);
        assert!(!cmds.is_empty());
    }

    #[test]
    fn test_parse_sakura_script_raiselike_extended() {
        let script = "\
            \\![raise,OnEvent,ref0,ref1]\
            \\![raiseplugin,pluginA,OnPlug,r1]\
            \\![notifyplugin,pluginB,OnNotify]\
            \\![timerraiseplugin,0,0,pluginC,OnTimer,r2]\
            \\![timernotifyplugin,0,0,pluginD,OnTimerN]\
            \\![execute,schedule-add,2026-10-31,12:00,Meeting,Notes]\
            \\![execute,extractarchive,a.zip,dest]\
            \\![execute,compressarchive,a.zip,dest]\
            \\![execute,createnar,a.zip,dest]\
            \\![execute,createupdatedata,a.zip,dest]\
            \\![execute,download,http://example.com,path]\
            \\![execute,upload,http://example.com,path]\
            \\![execute,mailcheck,acc]\
            \\![execute,mailsend,target]\
            \\![execute,deletefile,path,dest]\
            \\![execute,resetballoonpos]\
            \\![execute,customcmd,arg1]\
            \\![create,shortcut]\
            \\![create,other]\
            \\![save,wallpaper]\
            \\![save,other]\
            \\![restore,wallpaper]\
            \\![restore,other]\
            \\![cancel,service,target]\
            \\![close,service,target]\
            \\![biff]\
            \\![executesntp]\
            \\![enter,scope0]\
            \\![leave,scope0]\
            \\![bind,clothing,ribbon,1]\
            \\![open,inputbox,id0,arg1]\
            \\![set,choicetimeout,10]\
            \\![set,balloonoffset,50,60]\
            \\![set,balloontimeout,5]\
            \\![set,windowstate,minimized]\
            \\![set,wallpaper,bg.png,stretch]\
            \\![set,httptimeout,30]\
            \\![set,proxy,127.0.0.1,8080]\
            \\![set,autoscroll,true]\
            \\![lock,balloonmove]\
            \\![unlock,balloonrepaint]\
            \\![lock,other]\
            \\*\\![change,ghost,sakura]\\![call,ghost,kero]\
        ";
        let cmds = parse_sakura_script(script);
        assert!(!cmds.is_empty());
    }

    #[test]
    fn test_parse_sakura_script_underscore_extended() {
        let script = "\
            \\_w[200]\
            \\_q[1]\
            \\_q\
            \\_?\
            \\_n\
            \\_!\
            \\_b[surface0.png,inline,10,20,opaque]\
            \\_a[id1,anchor text]\\_a\
            \\_s[1]\
            \\_s\
            \\_m[FF00AA]\
            \\_u[0x3042]\
            \\_u[1234]\
            \\_l[100,200]\
            \\__c\
            \\__t\
            \\__v[voice_opt]\
            \\__q[1]\
            \\__q\
            \\_+\
            \\_unknown\
        ";
        let cmds = parse_sakura_script(script);
        assert!(!cmds.is_empty());
    }

    #[test]
    fn test_parse_sakura_script_raw_mode_and_no_autowrap() {
        let script = "\\_?\\0\\s0\\nRawText\\_?\\_nNoAutoWrapText\\_n";
        let cmds = parse_sakura_script(script);
        assert_eq!(
            cmds[0],
            SakuraCommand::Text("\\0\\s0\\nRawText".to_string())
        );
        assert_eq!(cmds[1], SakuraCommand::AutoPause);
        assert_eq!(cmds[2], SakuraCommand::NewLineNoPause);
        assert_eq!(cmds[3], SakuraCommand::Text("NoAutoWrapText".to_string()));
        assert_eq!(cmds[4], SakuraCommand::NewLineNoPause);
    }

    #[test]
    fn test_parse_sakura_script_parser_edge_cases() {
        let script = "\\\\\\C\\a\\v\\+\\k[ignored]\\2\\3\\4\\5\\6\\7\\8\\9\\c[arg_clear]\\j[my_jump]\\&[amp]\\&[lt]\\&[gt]\\&[quot]\\&[apos]\\&[nbsp]\\&[custom]";
        let cmds = parse_sakura_script(script);
        assert!(!cmds.is_empty());
        assert!(cmds.contains(&SakuraCommand::Target(2)));
        assert!(cmds.contains(&SakuraCommand::Target(9)));
        assert!(cmds.contains(&SakuraCommand::Clear));
        assert!(cmds.contains(&SakuraCommand::AudioWait));
        assert!(cmds.contains(&SakuraCommand::Voice("".into())));
        assert!(cmds.contains(&SakuraCommand::Plus));
    }
}
