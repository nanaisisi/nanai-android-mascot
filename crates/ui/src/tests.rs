use super::*;

#[test]
fn test_open_shift_jis_file() {
    let path = concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/../../assets/ghost/mock_nanai/install.txt"
    );
    let content = open_shift_jis_file(path).unwrap();
    assert!(!content.is_empty());
}

#[test]
fn test_descript_parse() {
    let sample = "charset,Shift_JIS\r\nname,SampleGhost\r\nsakura.name,Nanai\r\nkero.name,Mini\r\nicon,icon.ico\r\ncraftmanw,Author\r\n";
    let desc = Descript::parse(sample);
    assert_eq!(desc.name().map(|s| s.as_str()), Some("SampleGhost"));
    assert_eq!(desc.sakura_name().map(|s| s.as_str()), Some("Nanai"));
    assert_eq!(desc.kero_name().map(|s| s.as_str()), Some("Mini"));
    assert_eq!(desc.icon().map(|s| s.as_str()), Some("icon.ico"));
    assert_eq!(desc.craftmanw().map(|s| s.as_str()), Some("Author"));
}

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

    assert_eq!(commands[0], SakuraCommand::Target(0)); // \h
    assert_eq!(commands[3], SakuraCommand::Target(0)); // \h
    assert_eq!(commands[4], SakuraCommand::Target(1)); // \u
    assert!(commands.contains(&SakuraCommand::NewLine { half: true }));
    // \n[half] が本文テキストに漏出していない
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
    // 未知タグ（\j / \__w）の引数が本文に漏出していない
    assert!(commands.iter().all(|c| match c {
        SakuraCommand::Text(t) => t == "あ",
        _ => true,
    }));
}

#[test]
fn test_collisionex_circle_and_ellipse() {
    let sample = r"surface2
{
collisionex0,face,circle,100,100,50
collisionex1,halo,ellipse,100,100,60,30
}
";
    let txt = SurfacesTxt::parse(sample);
    let def2 = txt.surface(2).unwrap();

    let face = def2.hit_test(140, 100).expect("円の内側は face");
    assert_eq!(face.name, "face");
    assert!(def2.hit_test(190, 100).is_none()); // 円の外側

    let halo = def2.hit_test(160, 100).expect("楕円の内側は halo");
    assert_eq!(halo.name, "halo");
    assert!(def2.hit_test(150, 40).is_none()); // 楕円の外側（y方向 半径30）
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
fn test_surfaces_txt_cursor_and_tooltip_wildcards() {
    let sample = r"cursor
{
mouseup,Head,system:hand
mousedown,Bust,system:finger
}
tooltips
{
Head,Pat here!
Bust,Poke here!
}
";
    let txt = SurfacesTxt::parse(sample);
    // Cursor query using scope 0 and scope 1 should both fall back to '*'
    assert_eq!(
        txt.get_cursor("sakura", "mouseup", "Head"),
        Some("system:hand")
    );
    assert_eq!(txt.get_cursor("0", "mouseup", "Head"), Some("system:hand"));
    assert_eq!(
        txt.get_cursor("kero", "mousedown", "Bust"),
        Some("system:finger")
    );
    assert_eq!(
        txt.get_cursor("1", "mousedown", "Bust"),
        Some("system:finger")
    );
    assert_eq!(txt.get_cursor("0", "nonexistent", "Head"), None);

    // Tooltip query fallback to '*'
    assert_eq!(txt.get_tooltip("sakura", "Head"), Some("Pat here!"));
    assert_eq!(txt.get_tooltip("0", "Head"), Some("Pat here!"));
    assert_eq!(txt.get_tooltip("kero", "Bust"), Some("Poke here!"));
    assert_eq!(txt.get_tooltip("1", "Bust"), Some("Poke here!"));
    assert_eq!(txt.get_tooltip("0", "NonExistent"), None);
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

#[test]
fn test_archive_entry_path_drive_letter_and_traversal() {
    use crate::update::validate_archive_entry_path;

    assert!(validate_archive_entry_path("ghost/master/aya.dll").is_ok());
    assert!(validate_archive_entry_path("shell/master/surface0.png").is_ok());

    assert!(validate_archive_entry_path("C:/evil.txt").is_err());
    assert!(validate_archive_entry_path("d:\\windows\\system32").is_err());
    assert!(validate_archive_entry_path("z:/path").is_err());

    assert!(validate_archive_entry_path("../traversal.txt").is_err());
    assert!(validate_archive_entry_path("/etc/passwd").is_err());
    assert!(validate_archive_entry_path("").is_err());
    assert!(validate_archive_entry_path("   ").is_err());
}
