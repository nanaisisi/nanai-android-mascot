//! AST ノードの条件判定、スコープフィルタ、ウェイト除去およびコマンド変換処理

use crate::script::ast::types::node::SakuraAstNode;
use crate::script::command::SakuraCommand;

impl SakuraAstNode {
    /// 指定した述語条件を満たす SakuraCommand が AST 内に存在するか判定する（早期リターン・高速判定）
    pub fn has_command(&self, predicate: &dyn Fn(&SakuraCommand) -> bool) -> bool {
        match self {
            SakuraAstNode::Command(cmd) => predicate(cmd),
            SakuraAstNode::Scope { children, .. } | SakuraAstNode::Anchor { children, .. } => {
                children.iter().any(|c| c.has_command(predicate))
            }
            SakuraAstNode::Root { children } => children.iter().any(|c| c.has_command(predicate)),
            SakuraAstNode::Choice { id, text, args } => {
                let cmd = SakuraCommand::Choice {
                    label: text.clone(),
                    id: id.clone(),
                    args: args.clone(),
                };
                predicate(&cmd)
            }
        }
    }

    /// 指定したスコープ（\0, \1, \p[N]）のノードのみを抽出した新しい AST ツリーを生成する
    pub fn filter_by_scope(&self, target_scope: u8) -> SakuraAstNode {
        match self {
            SakuraAstNode::Root { children } => {
                let mut filtered = Vec::new();
                for child in children {
                    if let SakuraAstNode::Scope {
                        scope,
                        children: s_children,
                    } = child
                        && *scope == target_scope
                    {
                        filtered.push(SakuraAstNode::Scope {
                            scope: *scope,
                            children: s_children.clone(),
                        });
                    }
                }
                SakuraAstNode::Root { children: filtered }
            }
            SakuraAstNode::Scope { scope, .. } => {
                if *scope == target_scope {
                    self.clone()
                } else {
                    SakuraAstNode::Root {
                        children: Vec::new(),
                    }
                }
            }
            _ => SakuraAstNode::Root {
                children: Vec::new(),
            },
        }
    }

    /// ログ保存や早送り再生用にウェイト（\w, \_w）コマンドを除去した AST ツリーを再帰生成する
    pub fn strip_waits(&self) -> SakuraAstNode {
        match self {
            SakuraAstNode::Command(SakuraCommand::Wait(_)) => SakuraAstNode::Root {
                children: Vec::new(),
            },
            SakuraAstNode::Command(_) | SakuraAstNode::Choice { .. } => self.clone(),
            SakuraAstNode::Scope { scope, children } => {
                let new_children: Vec<SakuraAstNode> = children
                    .iter()
                    .map(|c| c.strip_waits())
                    .filter(
                        |c| !matches!(c, SakuraAstNode::Root { children } if children.is_empty()),
                    )
                    .collect();
                SakuraAstNode::Scope {
                    scope: *scope,
                    children: new_children,
                }
            }
            SakuraAstNode::Anchor {
                id,
                text,
                args,
                children,
            } => {
                let new_children: Vec<SakuraAstNode> = children
                    .iter()
                    .map(|c| c.strip_waits())
                    .filter(
                        |c| !matches!(c, SakuraAstNode::Root { children } if children.is_empty()),
                    )
                    .collect();
                SakuraAstNode::Anchor {
                    id: id.clone(),
                    text: text.clone(),
                    args: args.clone(),
                    children: new_children,
                }
            }
            SakuraAstNode::Root { children } => {
                let new_children: Vec<SakuraAstNode> = children
                    .iter()
                    .map(|c| c.strip_waits())
                    .filter(
                        |c| !matches!(c, SakuraAstNode::Root { children } if children.is_empty()),
                    )
                    .collect();
                SakuraAstNode::Root {
                    children: new_children,
                }
            }
        }
    }

    /// AST 内の各 SakuraCommand に対して変換関数を適用し、新しい AST を生成する
    pub fn map_commands(
        &self,
        transform: &impl Fn(&SakuraCommand) -> SakuraCommand,
    ) -> SakuraAstNode {
        match self {
            SakuraAstNode::Command(cmd) => SakuraAstNode::Command(transform(cmd)),
            SakuraAstNode::Choice { .. } => self.clone(),
            SakuraAstNode::Scope { scope, children } => SakuraAstNode::Scope {
                scope: *scope,
                children: children.iter().map(|c| c.map_commands(transform)).collect(),
            },
            SakuraAstNode::Anchor {
                id,
                text,
                args,
                children,
            } => SakuraAstNode::Anchor {
                id: id.clone(),
                text: text.clone(),
                args: args.clone(),
                children: children.iter().map(|c| c.map_commands(transform)).collect(),
            },
            SakuraAstNode::Root { children } => SakuraAstNode::Root {
                children: children.iter().map(|c| c.map_commands(transform)).collect(),
            },
        }
    }
}
