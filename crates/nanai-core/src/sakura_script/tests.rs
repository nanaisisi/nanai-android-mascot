use super::*;

#[test]
fn test_parse_sakura_script_basic() {
    let script = "\\0\\s[0]こんにちは\\n\\1\\s[10]よろしくね\\e";
    let tokens = parse_sakura_script(script);

    assert_eq!(tokens[0], SakuraToken::Scope(0));
    assert_eq!(tokens[1], SakuraToken::Surface(0));
    assert_eq!(tokens[2], SakuraToken::Text("こんにちは".to_string()));
    assert_eq!(tokens[3], SakuraToken::Newline);
    assert_eq!(tokens[4], SakuraToken::Scope(1));
    assert_eq!(tokens[5], SakuraToken::Surface(10));
    assert_eq!(tokens[6], SakuraToken::Text("よろしくね".to_string()));
    assert_eq!(tokens[7], SakuraToken::Halt);
}

#[test]
fn test_parse_sakura_script_extended() {
    let script = "\\q[選択肢,id1]\\_a[anchor_id]リンク文字\\_a\\b[0]\\i[10]";
    let tokens = parse_sakura_script(script);

    assert_eq!(
        tokens[0],
        SakuraToken::Choice {
            title: "選択肢".to_string(),
            id: "id1".to_string(),
            args: vec![]
        }
    );
    assert_eq!(
        tokens[1],
        SakuraToken::Anchor {
            id: "anchor_id".to_string(),
            text: "リンク文字".to_string()
        }
    );
    assert_eq!(tokens[2], SakuraToken::Balloon(0));
    assert_eq!(tokens[3], SakuraToken::Animation(10));
}

#[test]
fn test_expand_sakura_environment_variables() {
    let ctx = SakuraEnvContext {
        username: "Master".to_string(),
        selfname: "Emily".to_string(),
        keroname: "Kero".to_string(),
        system_os: "Android".to_string(),
        system_version: "1.0.0".to_string(),
        ..Default::default()
    };
    let script =
        "こんにちは %username さん。私は %selfname です。OSは %system.os (%system.version) です。";
    let expanded = expand_sakura_environment_variables(script, &ctx);
    assert_eq!(
        expanded,
        "こんにちは Master さん。私は Emily です。OSは Android (1.0.0) です。"
    );
}

#[test]
fn test_parse_sakura_script_font_multi_args() {
    let script = "\\f[color,255,128,0]赤文字\\f[default]";
    let tokens = parse_sakura_script(script);

    assert_eq!(
        tokens[0],
        SakuraToken::Font {
            property: "color".to_string(),
            args: vec!["255".to_string(), "128".to_string(), "0".to_string()]
        }
    );
    assert_eq!(tokens[1], SakuraToken::Text("赤文字".to_string()));
    assert_eq!(
        tokens[2],
        SakuraToken::Font {
            property: "default".to_string(),
            args: vec![]
        }
    );
}

#[test]
fn test_parse_sakura_script_cycle6_extensions() {
    // \_u[0x41] -> A, \_m[66] -> B, \&[amp] -> &
    let script = "\\_u[0x41]\\_m[66]\\&[amp]";
    let tokens = parse_sakura_script(script);
    assert_eq!(tokens[0], SakuraToken::Text("A".to_string()));
    assert_eq!(tokens[1], SakuraToken::Text("B".to_string()));
    assert_eq!(tokens[2], SakuraToken::Text("&".to_string()));

    // \__q
    let script_q = "\\__q[OnChoice,arg1]Choice text\\__q";
    let tokens_q = parse_sakura_script(script_q);
    assert_eq!(
        tokens_q[0],
        SakuraToken::ChoiceScopeBegin {
            id: "OnChoice".to_string(),
            args: vec!["OnChoice".to_string(), "arg1".to_string()]
        }
    );
    assert_eq!(tokens_q[1], SakuraToken::Text("Choice text".to_string()));
    assert_eq!(tokens_q[2], SakuraToken::ChoiceScopeEnd);
}
