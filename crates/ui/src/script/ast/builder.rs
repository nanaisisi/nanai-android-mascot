use super::types::SakuraAstNode;
use crate::script::command::SakuraCommand;

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
    fn test_build_sakura_ast_edge_cases() {
        let commands = vec![
            SakuraCommand::Text("Root text".to_string()),
            SakuraCommand::Target(0),
            SakuraCommand::Text("Scope 0 text".to_string()),
            SakuraCommand::Choice {
                label: "Choice 1".to_string(),
                id: "id1".to_string(),
                args: vec![],
            },
            SakuraCommand::Anchor {
                id: "a1".to_string(),
                text: "Anchor".to_string(),
                args: vec![],
            },
            SakuraCommand::Target(1),
            SakuraCommand::Text("Scope 1 text".to_string()),
        ];
        let ast = build_sakura_ast(&commands);
        if let SakuraAstNode::Root { children } = ast {
            assert!(!children.is_empty());
        }
    }

    #[test]
    fn test_build_sakura_ast_root_only() {
        let commands = vec![
            SakuraCommand::Text("Root only text".to_string()),
            SakuraCommand::Anchor {
                id: "a_root".to_string(),
                text: "Root Anchor".to_string(),
                args: vec![],
            },
            SakuraCommand::Choice {
                label: "Root Choice".to_string(),
                id: "c_root".to_string(),
                args: vec![],
            },
        ];
        let ast = build_sakura_ast(&commands);
        if let SakuraAstNode::Root { children } = ast {
            assert_eq!(children.len(), 3);
        }
    }

    #[test]
    fn test_build_sakura_ast_trailing_target() {
        let commands = vec![SakuraCommand::Target(0)];
        let ast = build_sakura_ast(&commands);
        if let SakuraAstNode::Root { children } = ast {
            assert_eq!(children.len(), 1);
        }
    }
}
