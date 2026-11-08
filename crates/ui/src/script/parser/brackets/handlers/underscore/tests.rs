/**
 * @file tests.rs
 * @brief アンダースコア系ブラケットコマンドハンドラー単体テスト
 */

use super::handlers::*;

#[test]
fn test_underscore_handlers_edge_cases() {
    let run = |script: &str| {
        let mut commands = Vec::new();
        let mut cb = |cmd| commands.push(cmd);
        let mut chars = script.chars().peekable();
        handle_underscore(&mut chars, &mut cb);
        commands
    };

    assert!(run("w[invalid]").is_empty());
    assert!(!run("w[100]").is_empty());

    assert!(!run("q[0]").is_empty());
    assert!(!run("q[1]").is_empty());
    assert!(!run("q").is_empty());

    assert!(!run("?hello\\_?").is_empty());
    assert!(!run("?unclosed").is_empty());
    assert!(!run("?hello\\_x").is_empty());

    assert!(!run("n").is_empty());
    assert!(!run("!").is_empty());

    assert!(!run("b[img.png, inline, 50, 60, opaque]").is_empty());

    assert!(!run("a[id1, arg1]AnchorText\\_a").is_empty());

    assert!(!run("s[false]").is_empty());
    assert!(!run("s").is_empty());

    assert!(!run("m[data]").is_empty());

    assert!(!run("u[0x41]").is_empty());
    assert!(!run("u[65]").is_empty());
    assert!(run("u[invalid]").is_empty());

    assert!(!run("l[10, 20]").is_empty());

    assert!(!run("_c").is_empty());
    assert!(!run("_t").is_empty());
    assert!(!run("_v[opt]").is_empty());
    assert!(!run("_q[0]").is_empty());
    assert!(!run("_q").is_empty());
    assert!(!run("_+").is_empty());
    assert!(run("_unknown").is_empty());

    assert!(run("z").is_empty());
}
