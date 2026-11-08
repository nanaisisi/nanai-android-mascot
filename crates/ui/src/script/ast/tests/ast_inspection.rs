/**
 * @file ast_inspection.rs
 * @brief SakuraAstNode の walk 走査、コマンド収集、ライフサイクル分類、アンカー/サーフィス検索、スコープフィルタ単体テスト
 */
use super::*;

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

    // Ast walk and node command accessors
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
fn test_ast_find_choices_and_surfaces() {
    let commands = vec![
        SakuraCommand::Target(0),
        SakuraCommand::Surface(10),
        SakuraCommand::Choice {
            label: "Select A".into(),
            id: "OnSelectA".into(),
            args: vec![],
        },
        SakuraCommand::Target(1),
        SakuraCommand::Surface(20),
        SakuraCommand::Choice {
            label: "Select B".into(),
            id: "OnSelectB".into(),
            args: vec!["arg1".into()],
        },
    ];
    let ast = build_sakura_ast(&commands);
    let choices = ast.find_choices();
    assert_eq!(choices.len(), 2);
    assert_eq!(
        choices[0],
        ("OnSelectA".to_string(), "Select A".to_string())
    );
    assert_eq!(
        choices[1],
        ("OnSelectB".to_string(), "Select B".to_string())
    );

    let surfaces = ast.find_surfaces();
    assert_eq!(surfaces, vec![10, 20]);
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

#[test]
fn test_ast_cycle8_find_anchors_text_length_and_scope_nodes() {
    let commands = vec![
        SakuraCommand::Target(0),
        SakuraCommand::Surface(0),
        SakuraCommand::Text("Hello ".into()),
        SakuraCommand::Anchor {
            id: "a1".into(),
            text: "World".into(),
            args: vec!["a1".into(), "r1".into()],
        },
        SakuraCommand::Choice {
            label: "Option 1".into(),
            id: "OnOpt1".into(),
            args: vec![],
        },
        SakuraCommand::Target(1),
        SakuraCommand::Surface(10),
        SakuraCommand::Text("Kero".into()),
    ];
    let ast = build_sakura_ast(&commands);

    // 1. find_anchors
    let anchors = ast.find_anchors();
    assert_eq!(anchors.len(), 1);
    assert_eq!(anchors[0], ("a1".to_string(), "World".to_string()));

    // 2. calculate_text_length
    let length = ast.calculate_text_length();
    assert_eq!(length, 23);

    // 3. scope_nodes
    let s0_nodes = ast.scope_nodes(0);
    assert_eq!(s0_nodes.len(), 4); // Surface, Text, Anchor, Choice
    let s1_nodes = ast.scope_nodes(1);
    assert_eq!(s1_nodes.len(), 2); // Surface, Text
    let s2_nodes = ast.scope_nodes(2);
    assert!(s2_nodes.is_empty());

    // Direct Scope node test
    if let SakuraAstNode::Root { children } = &ast {
        let direct_s0 = &children[0];
        let nodes_from_scope = direct_s0.scope_nodes(0);
        assert_eq!(nodes_from_scope.len(), 4);
        let nodes_from_scope_mismatch = direct_s0.scope_nodes(1);
        assert!(nodes_from_scope_mismatch.is_empty());
    }
}

#[test]
fn test_ast_cycle9_advanced_inspection_and_filtering() {
    let commands = vec![
        SakuraCommand::Target(0),
        SakuraCommand::Surface(10),
        SakuraCommand::Wait(500),
        SakuraCommand::Animation {
            id: 101,
            wait: true,
        },
        SakuraCommand::Text("Hello 0".into()),
        SakuraCommand::Target(1),
        SakuraCommand::Surface(20),
        SakuraCommand::Animation {
            id: 202,
            wait: false,
        },
        SakuraCommand::Wait(300),
        SakuraCommand::Text("Hello 1".into()),
    ];
    let ast = build_sakura_ast(&commands);

    // 1. find_animations
    let anims = ast.find_animations();
    assert_eq!(anims.len(), 2);
    assert_eq!(anims[0], (101, true));
    assert_eq!(anims[1], (202, false));

    // 2. has_command
    assert!(ast.has_command(&|cmd| matches!(cmd, SakuraCommand::Wait(_))));
    assert!(ast.has_command(&|cmd| matches!(cmd, SakuraCommand::Surface(20))));
    assert!(!ast.has_command(&|cmd| matches!(cmd, SakuraCommand::Halt)));

    // 3. filter_by_scope
    let scope0_ast = ast.filter_by_scope(0);
    if let SakuraAstNode::Root { children } = &scope0_ast {
        assert_eq!(children.len(), 1);
        if let SakuraAstNode::Scope { scope, children } = &children[0] {
            assert_eq!(*scope, 0);
            assert_eq!(children.len(), 4);
        } else {
            panic!("Expected Scope node");
        }
    } else {
        panic!("Expected Root node");
    }
    assert_eq!(scope0_ast.find_surfaces(), vec![10]);

    // 4. strip_waits
    let clean_ast = ast.strip_waits();
    assert!(!clean_ast.has_command(&|cmd| matches!(cmd, SakuraCommand::Wait(_))));
    assert_eq!(clean_ast.find_animations().len(), 2);
    assert_eq!(clean_ast.calculate_text_length(), 14);
}

#[test]
fn test_ast_cycle10_map_commands_extract_text_and_diagnostics() {
    let commands = vec![
        SakuraCommand::Target(0),
        SakuraCommand::Surface(0),
        SakuraCommand::Text("Hello, ".into()),
        SakuraCommand::Anchor {
            id: "world_link".into(),
            text: "World".into(),
            args: vec![],
        },
        SakuraCommand::Wait(500),
        SakuraCommand::Choice {
            label: "!".into(),
            id: "excl".into(),
            args: vec![],
        },
    ];
    let ast = build_sakura_ast(&commands);

    // 1. extract_text
    let text = ast.extract_text();
    assert_eq!(text, "Hello, World!");

    // 2. node_count & depth
    assert_eq!(ast.node_count(), 8); // Root(1) + Scope(1) + Surface(1) + Text(1) + Anchor(1) + AnchorText(1) + Wait(1) + Choice(1) = 8
    assert_eq!(ast.depth(), 4); // Root(1) -> Scope(2) -> Anchor(3) -> Text(4)

    // 3. map_commands (Replace all Wait commands with Wait(10))
    let mapped_ast = ast.map_commands(&|cmd| match cmd {
        SakuraCommand::Wait(_) => SakuraCommand::Wait(10),
        other => other.clone(),
    });
    let collected = mapped_ast.collect_commands();
    assert!(collected.iter().any(|c| matches!(c, SakuraCommand::Wait(10))));
    assert!(!collected.iter().any(|c| matches!(c, SakuraCommand::Wait(500))));
}
