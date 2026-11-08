/**
 * @file tests.rs
 * @brief parse_sakura_script の総合動作単体テスト
 */

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
