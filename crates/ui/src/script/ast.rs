use serde::{Deserialize, Serialize};

use super::command::SakuraCommand;

/// さくらスクリプトの単一トークン表現
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SakuraToken {
    pub command: SakuraCommand,
    pub raw: Option<String>,
}

impl SakuraToken {
    pub fn new(command: SakuraCommand) -> Self {
        Self { command, raw: None }
    }

    pub fn with_raw(command: SakuraCommand, raw: impl Into<String>) -> Self {
        Self {
            command,
            raw: Some(raw.into()),
        }
    }
}

/// さくらスクリプトの AST ノード
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "node_type")]
pub enum SakuraAstNode {
    /// 通常のコマンド / トークンノード
    Command(SakuraCommand),
    /// スコープ（\\0, \\1, \\p[N]）ブロック
    Scope {
        scope: u8,
        children: Vec<SakuraAstNode>,
    },
    /// アンカー（\\_a[...]...\\_a）ブロック
    Anchor {
        id: String,
        text: String,
        args: Vec<String>,
        children: Vec<SakuraAstNode>,
    },
    /// 選択肢（\\q[label,id,...]）ノード
    Choice {
        id: String,
        text: String,
        args: Vec<String>,
    },
    /// スクリプト全体のルートノード
    Root { children: Vec<SakuraAstNode> },
}

/// フラットな SakuraCommand 列から階層的な AST を構築する
pub fn build_sakura_ast(commands: &[SakuraCommand]) -> SakuraAstNode {
    let mut root_children: Vec<SakuraAstNode> = Vec::new();
    let mut current_scope: Option<u8> = None;
    let mut scope_children: Vec<SakuraAstNode> = Vec::new();

    for cmd in commands {
        match cmd {
            SakuraCommand::Target(scope) => {
                if let Some(s) = current_scope {
                    root_children.push(SakuraAstNode::Scope {
                        scope: s,
                        children: std::mem::take(&mut scope_children),
                    });
                }
                current_scope = Some(*scope);
            }
            SakuraCommand::Anchor { id, text, args } => {
                let anchor_node = SakuraAstNode::Anchor {
                    id: id.clone(),
                    text: text.clone(),
                    args: args.clone(),
                    children: vec![SakuraAstNode::Command(SakuraCommand::Text(text.clone()))],
                };
                if current_scope.is_some() {
                    scope_children.push(anchor_node);
                } else {
                    root_children.push(anchor_node);
                }
            }
            SakuraCommand::Choice { label, id, args } => {
                let choice_node = SakuraAstNode::Choice {
                    id: id.clone(),
                    text: label.clone(),
                    args: args.clone(),
                };
                if current_scope.is_some() {
                    scope_children.push(choice_node);
                } else {
                    root_children.push(choice_node);
                }
            }
            _ => {
                let node = SakuraAstNode::Command(cmd.clone());
                if current_scope.is_some() {
                    scope_children.push(node);
                } else {
                    root_children.push(node);
                }
            }
        }
    }

    if let Some(s) = current_scope {
        root_children.push(SakuraAstNode::Scope {
            scope: s,
            children: scope_children,
        });
    }

    SakuraAstNode::Root {
        children: root_children,
    }
}

#[cfg(test)]
mod tests {
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
}
