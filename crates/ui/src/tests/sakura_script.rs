/**
 * @file sakura_script.rs
 * @brief さくらスクリプト構文パース・コマンド生成統合テスト
 */
use super::*;

#[test]
fn test_sakura_script_extended() {
    let script = r"\0\s[0]こんにちは\w5\n\q[はい,id_yes]\e";
    let mut commands = Vec::new();
    execute_sakura_script(script, |cmd| commands.push(cmd));

    assert_eq!(commands[0], SakuraCommand::Target(0));
    assert_eq!(commands[1], SakuraCommand::Surface(0));
    assert_eq!(commands[2], SakuraCommand::Text("こんにちは".into()));
    assert_eq!(commands[3], SakuraCommand::Wait(250));
    assert_eq!(commands[4], SakuraCommand::NewLine { half: false });
    assert_eq!(
        commands[5],
        SakuraCommand::Choice {
            label: "はい".into(),
            id: "id_yes".into(),
            args: Vec::new(),
        }
    );
    assert_eq!(commands[6], SakuraCommand::End);
}

#[test]
fn test_sakura_script_quicksection_and_choice_scope() {
    let script = r"\![quicksection,1]\__q[OnTest,arg1]ChoiceText\__q\![quicksection,false]";
    let cmds = parse_sakura_script(script);
    assert_eq!(cmds.len(), 3);
    assert_eq!(cmds[0], SakuraCommand::Quick(true));
    assert_eq!(
        cmds[1],
        SakuraCommand::Choice {
            label: "ChoiceText".to_string(),
            id: "OnTest".to_string(),
            args: vec!["arg1".to_string()],
        }
    );
    assert_eq!(cmds[2], SakuraCommand::Quick(false));
}

#[test]
fn test_sakura_script_new_tags() {
    let script = r"\0\_q\x\_a[anchor01]リンク\_a\![raise,OnTest,1,2]\![bind,clothing,ribbon,1]";
    let mut commands = Vec::new();
    execute_sakura_script(script, |cmd| commands.push(cmd));

    assert_eq!(commands[0], SakuraCommand::Target(0));
    assert_eq!(commands[1], SakuraCommand::Quick(true));
    assert_eq!(commands[2], SakuraCommand::ClickWait);
    assert_eq!(
        commands[3],
        SakuraCommand::Anchor {
            id: "anchor01".into(),
            text: "リンク".into(),
            args: Vec::new(),
        }
    );
    assert_eq!(
        commands[4],
        SakuraCommand::Raise {
            event: "OnTest".into(),
            references: vec!["1".into(), "2".into()],
        }
    );
    assert_eq!(
        commands[5],
        SakuraCommand::Bind {
            category: "clothing".into(),
            part: "ribbon".into(),
            status: Some(true),
        }
    );
}

#[test]
fn test_sakura_script_extended_tags() {
    let script = r"\b[0]\b[-1]\t\-\_s\_l[10,20]\f[color,red]\f[bold]";
    let mut commands = Vec::new();
    execute_sakura_script(script, |cmd| commands.push(cmd));

    assert_eq!(commands[0], SakuraCommand::Balloon(0));
    assert_eq!(commands[1], SakuraCommand::Balloon(-1));
    assert_eq!(commands[2], SakuraCommand::Timeout);
    assert_eq!(commands[3], SakuraCommand::Halt);
    assert_eq!(commands[4], SakuraCommand::Sync(true));
    assert_eq!(
        commands[5],
        SakuraCommand::Offset {
            x: "10".into(),
            y: "20".into(),
        }
    );
    assert_eq!(
        commands[6],
        SakuraCommand::Font {
            tag: "color".into(),
            param: Some("red".into()),
        }
    );
    assert_eq!(
        commands[7],
        SakuraCommand::Font {
            tag: "bold".into(),
            param: None,
        }
    );

    let script_q = r"\_q高速\_q[0]通常\_q[1]再度高速";
    let mut cmds_q = Vec::new();
    execute_sakura_script(script_q, |cmd| cmds_q.push(cmd));
    assert_eq!(cmds_q[0], SakuraCommand::Quick(true));
    assert_eq!(cmds_q[1], SakuraCommand::Text("高速".into()));
    assert_eq!(cmds_q[2], SakuraCommand::Quick(false));
    assert_eq!(cmds_q[3], SakuraCommand::Text("通常".into()));
    assert_eq!(cmds_q[4], SakuraCommand::Quick(true));
    assert_eq!(cmds_q[5], SakuraCommand::Text("再度高速".into()));

    let script_ps = r"\p[2]\p3\_s[1]同期\_s[0]非同期";
    let mut cmds_ps = Vec::new();
    execute_sakura_script(script_ps, |cmd| cmds_ps.push(cmd));
    assert_eq!(cmds_ps[0], SakuraCommand::Target(2));
    assert_eq!(cmds_ps[1], SakuraCommand::Target(3));
    assert_eq!(cmds_ps[2], SakuraCommand::Sync(true));
    assert_eq!(cmds_ps[3], SakuraCommand::Text("同期".into()));
    assert_eq!(cmds_ps[4], SakuraCommand::Sync(false));
    assert_eq!(cmds_ps[5], SakuraCommand::Text("非同期".into()));
}

#[test]
fn test_sakura_script_legacy_scope_and_newline_half() {
    let script = r"\h\s[0]ひと\h\u\s[10]うなぎ\n[half]\0下半分";
    let mut commands = Vec::new();
    execute_sakura_script(script, |cmd| commands.push(cmd));

    assert_eq!(commands[0], SakuraCommand::Target(0));
    assert_eq!(commands[3], SakuraCommand::Target(0));
    assert_eq!(commands[4], SakuraCommand::Target(1));
    assert!(commands.contains(&SakuraCommand::NewLine { half: true }));
    assert!(commands.iter().all(|c| match c {
        SakuraCommand::Text(t) => !t.contains("half"),
        _ => true,
    }));
}

#[test]
fn test_sakura_script_animation() {
    let script = r"\0\1は鳴き声\i[3,wait]\i7この間は本文";
    let mut commands = Vec::new();
    execute_sakura_script(script, |cmd| commands.push(cmd));

    assert_eq!(commands[3], SakuraCommand::Animation { id: 3, wait: true });
    assert_eq!(commands[4], SakuraCommand::Animation { id: 7, wait: false });
    assert_eq!(commands[5], SakuraCommand::Text("この間は本文".into()));
}

#[test]
fn test_sakura_script_passthrough_and_unknown_tags() {
    let script = r"\0\![open,inputbox,--timeout=5]\![set,str,hello]\j[1,2]\__w[500]あ";
    let mut commands = Vec::new();
    execute_sakura_script(script, |cmd| commands.push(cmd));

    assert_eq!(
        commands[1],
        SakuraCommand::OpenDialog {
            dialog_type: "inputbox".into(),
            id: "--timeout=5".into(),
            args: Vec::new(),
        }
    );
    assert_eq!(
        commands[2],
        SakuraCommand::Command {
            args: vec!["set".into(), "str".into(), "hello".into()]
        }
    );
    assert!(commands.iter().all(|c| match c {
        SakuraCommand::Text(t) => t == "あ",
        _ => true,
    }));
}

#[test]
fn test_sakura_script_postmessage_command() {
    let script = r"\0\m[1024,10,20]本文";
    let mut commands = Vec::new();
    execute_sakura_script(script, |cmd| commands.push(cmd));

    assert_eq!(commands[0], SakuraCommand::Target(0));
    assert_eq!(
        commands[1],
        SakuraCommand::PostMessage {
            umsg: "1024".into(),
            wparam: "10".into(),
            lparam: "20".into(),
        }
    );
    assert_eq!(commands[2], SakuraCommand::Text("本文".into()));
}

#[test]
fn test_sakura_script_raw_mode_and_no_autowrap() {
    let script = r"\0\_n本文1\_?\s[0]\w9\_?本文2\_n";
    let mut commands = Vec::new();
    execute_sakura_script(script, |cmd| commands.push(cmd));

    assert_eq!(commands[0], SakuraCommand::Target(0));
    assert_eq!(commands[1], SakuraCommand::NewLineNoPause);
    assert_eq!(commands[2], SakuraCommand::Text("本文1".into()));
    assert_eq!(commands[3], SakuraCommand::Text(r"\s[0]\w9".into()));
    assert_eq!(commands[4], SakuraCommand::AutoPause);
    assert_eq!(commands[5], SakuraCommand::Text("本文2".into()));
    assert_eq!(commands[6], SakuraCommand::NewLineNoPause);
}
