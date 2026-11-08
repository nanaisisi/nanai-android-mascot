/**
 * @file ast_building.rs
 * @brief build_sakura_ast による AST スコープグループ化・選択肢・トークン構造体単体テスト
 */

use super::*;

#[test]
fn test_build_sakura_ast_scope_grouping() {
    let commands = vec![
        SakuraCommand::Target(0),
        SakuraCommand::Surface(0),
        SakuraCommand::Text("Hello".into()),
        SakuraCommand::Target(1),
        SakuraCommand::Surface(10),
        SakuraCommand::Text("Hi".into()),
    ];
    let ast = build_sakura_ast(&commands);
    if let SakuraAstNode::Root { children } = ast {
        assert_eq!(children.len(), 2);
        if let SakuraAstNode::Scope {
            scope,
            children: s0,
        } = &children[0]
        {
            assert_eq!(*scope, 0);
            assert_eq!(s0.len(), 2);
        } else {
            panic!("Expected Scope node");
        }
        if let SakuraAstNode::Scope {
            scope,
            children: s1,
        } = &children[1]
        {
            assert_eq!(*scope, 1);
            assert_eq!(s1.len(), 2);
        } else {
            panic!("Expected Scope node");
        }
    } else {
        panic!("Expected Root node");
    }
}

#[test]
fn test_build_sakura_ast_choice_node() {
    let commands = vec![
        SakuraCommand::Target(0),
        SakuraCommand::Choice {
            label: "Select Me".into(),
            id: "OnChoice1".into(),
            args: vec!["arg1".into()],
        },
    ];
    let ast = build_sakura_ast(&commands);
    if let SakuraAstNode::Root { children } = ast {
        assert_eq!(children.len(), 1);
        if let SakuraAstNode::Scope {
            scope,
            children: s0,
        } = &children[0]
        {
            assert_eq!(*scope, 0);
            assert_eq!(s0.len(), 1);
            assert_eq!(
                s0[0],
                SakuraAstNode::Choice {
                    id: "OnChoice1".into(),
                    text: "Select Me".into(),
                    args: vec!["arg1".into()],
                }
            );
        } else {
            panic!("Expected Scope node");
        }
    } else {
        panic!("Expected Root node");
    }
}

#[test]
fn test_sakura_token_constructors() {
    let tok1 = SakuraToken::new(SakuraCommand::Clear);
    assert_eq!(tok1.command, SakuraCommand::Clear);
    assert_eq!(tok1.raw, None);

    let tok2 = SakuraToken::with_raw(SakuraCommand::Clear, "\\c");
    assert_eq!(tok2.command, SakuraCommand::Clear);
    assert_eq!(tok2.raw, Some("\\c".to_string()));
}

#[test]
fn test_build_sakura_ast_root_level_anchor_and_commands() {
    let commands = vec![
        SakuraCommand::Anchor {
            id: "anchor1".into(),
            text: "click".into(),
            args: vec![],
        },
        SakuraCommand::Text("Plain text at root".into()),
    ];
    let ast = build_sakura_ast(&commands);
    if let SakuraAstNode::Root { children } = ast {
        assert_eq!(children.len(), 2);
    } else {
        panic!("Expected Root node");
    }
}
