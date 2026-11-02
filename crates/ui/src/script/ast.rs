use serde::{Deserialize, Serialize};

use super::command::{SakuraCommand, SakuraScriptLifetime};

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

impl SakuraAstNode {
    /// ASTツリーを深さ優先で走査し、各ノードに対してビジターコールバックを実行する
    pub fn walk<'a>(&'a self, visitor: &mut impl FnMut(&'a SakuraAstNode)) {
        visitor(self);
        match self {
            SakuraAstNode::Root { children }
            | SakuraAstNode::Scope { children, .. }
            | SakuraAstNode::Anchor { children, .. } => {
                for child in children {
                    child.walk(visitor);
                }
            }
            SakuraAstNode::Command(_) | SakuraAstNode::Choice { .. } => {}
        }
    }

    /// ASTツリー内の全 SakuraCommand を順序通りに抽出する
    pub fn collect_commands(&self) -> Vec<SakuraCommand> {
        let mut commands = Vec::new();
        self.walk(&mut |node| match node {
            SakuraAstNode::Command(cmd) => commands.push(cmd.clone()),
            SakuraAstNode::Scope { scope, .. } => commands.push(SakuraCommand::Target(*scope)),
            SakuraAstNode::Choice { id, text, args } => commands.push(SakuraCommand::Choice {
                label: text.clone(),
                id: id.clone(),
                args: args.clone(),
            }),
            _ => {}
        });
        commands
    }

    /// 指定した寿命（Scope / Script / Permanent）に合致するコマンド群を抽出する
    pub fn collect_commands_by_lifetime(
        &self,
        lifetime: SakuraScriptLifetime,
    ) -> Vec<SakuraCommand> {
        self.collect_commands()
            .into_iter()
            .filter(|cmd| cmd.lifetime() == lifetime)
            .collect()
    }
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
    }
}
