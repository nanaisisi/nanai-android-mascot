//! 選択肢・サーフィス・アンカー・アニメーション検索およびスコープフィルタテスト

use super::super::*;

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

    let anchors = ast.find_anchors();
    assert_eq!(anchors.len(), 1);
    assert_eq!(anchors[0], ("a1".to_string(), "World".to_string()));

    let length = ast.calculate_text_length();
    assert_eq!(length, 23);

    let s0_nodes = ast.scope_nodes(0);
    assert_eq!(s0_nodes.len(), 4);
    let s1_nodes = ast.scope_nodes(1);
    assert_eq!(s1_nodes.len(), 2);
    let s2_nodes = ast.scope_nodes(2);
    assert!(s2_nodes.is_empty());

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

    let anims = ast.find_animations();
    assert_eq!(anims.len(), 2);
    assert_eq!(anims[0], (101, true));
    assert_eq!(anims[1], (202, false));

    assert!(ast.has_command(&|cmd| matches!(cmd, SakuraCommand::Wait(_))));
    assert!(ast.has_command(&|cmd| matches!(cmd, SakuraCommand::Surface(20))));
    assert!(!ast.has_command(&|cmd| matches!(cmd, SakuraCommand::Halt)));

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

    let clean_ast = ast.strip_waits();
    assert!(!clean_ast.has_command(&|cmd| matches!(cmd, SakuraCommand::Wait(_))));
    assert_eq!(clean_ast.find_animations().len(), 2);
    assert_eq!(clean_ast.calculate_text_length(), 14);
}
