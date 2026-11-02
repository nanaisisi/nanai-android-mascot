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
