//! AST ツリーの walk 走査、コマンド収集、ライフサイクル分類テスト

use super::super::*;

#[test]
fn test_ast_walk_and_collect_commands() {
    let commands = vec![
        SakuraCommand::Target(0),
        SakuraCommand::Surface(1),
        SakuraCommand::Font {
            tag: "bold".into(),
            param: Some("1".into()),
        },
        SakuraCommand::Text("Hello".into()),
        SakuraCommand::Choice {
            label: "Go".into(),
            id: "OnGo".into(),
            args: vec!["extra".into()],
        },
    ];
    let ast = build_sakura_ast(&commands);

    let mut node_count = 0;
    ast.walk(&mut |_node| {
        node_count += 1;
    });
    assert!(node_count >= 5);

    let collected = ast.collect_commands();
    assert_eq!(collected.len(), 5);
    assert_eq!(collected[0], SakuraCommand::Target(0));
    assert_eq!(collected[1], SakuraCommand::Surface(1));
    assert_eq!(
        collected[2],
        SakuraCommand::Font {
            tag: "bold".into(),
            param: Some("1".into())
        }
    );
    assert_eq!(collected[3], SakuraCommand::Text("Hello".into()));
    assert_eq!(
        collected[4],
        SakuraCommand::Choice {
            label: "Go".into(),
            id: "OnGo".into(),
            args: vec!["extra".into()],
        }
    );

    let scope_cmds = ast.collect_commands_by_lifetime(SakuraScriptLifetime::Scope);
    assert_eq!(scope_cmds.len(), 1);
    assert_eq!(
        scope_cmds[0],
        SakuraCommand::Font {
            tag: "bold".into(),
            param: Some("1".into())
        }
    );

    let perm_cmds = ast.collect_commands_by_lifetime(SakuraScriptLifetime::Permanent);
    assert_eq!(perm_cmds.len(), 1);
    assert_eq!(perm_cmds[0], SakuraCommand::Surface(1));

    let mut visited = 0;
    let mut visitor = |_node: &SakuraAstNode| visited += 1;
    ast.walk(&mut visitor);
    assert!(visited > 0);

    let script_cmds = ast.collect_commands_by_lifetime(SakuraScriptLifetime::Script);
    assert_eq!(script_cmds.len(), 3);
}

#[test]
fn test_ast_cycle5_lifetime_classification() {
    let commands = vec![
        SakuraCommand::NewLineNoPause,
        SakuraCommand::AutoPause,
        SakuraCommand::NoUserBreak(true),
        SakuraCommand::WindowState("minimize".into()),
        SakuraCommand::SetWallpaper {
            filename: "wall.png".into(),
            option: "center".into(),
        },
        SakuraCommand::LockBalloonRepaint(true),
        SakuraCommand::BalloonOffset { x: 10, y: 20 },
    ];
    let ast = build_sakura_ast(&commands);

    let script_cmds = ast.collect_commands_by_lifetime(SakuraScriptLifetime::Script);
    assert_eq!(script_cmds.len(), 5);

    let perm_cmds = ast.collect_commands_by_lifetime(SakuraScriptLifetime::Permanent);
    assert_eq!(perm_cmds.len(), 2);
}

#[test]
fn test_ast_walk_anchor_and_empty_containers() {
    let anchor_child = SakuraAstNode::Command(SakuraCommand::Surface(5));
    let anchor_node = SakuraAstNode::Anchor {
        id: "anchor1".to_string(),
        text: "Link".to_string(),
        args: vec![],
        children: vec![anchor_child],
    };

    let mut visited = 0;
    anchor_node.walk(&mut |_| visited += 1);
    assert_eq!(visited, 2);

    assert_eq!(anchor_node.find_surfaces(), vec![5]);

    let empty_root = SakuraAstNode::Root { children: vec![] };
    let mut empty_visited = 0;
    empty_root.walk(&mut |_| empty_visited += 1);
    assert_eq!(empty_visited, 1);
}
