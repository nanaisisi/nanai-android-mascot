//! SakuraAstNode の検索・抽出・フィルタリング操作モジュール

use super::node::SakuraAstNode;
use crate::script::command::{SakuraCommand, SakuraScriptLifetime};

impl SakuraAstNode {
    /// AST 内のすべての選択肢 (id, label) を抽出する
    pub fn find_choices(&self) -> Vec<(String, String)> {
        let mut choices = Vec::new();
        self.walk(&mut |node| {
            if let SakuraAstNode::Choice { id, text, .. } = node {
                choices.push((id.clone(), text.clone()));
            }
        });
        choices
    }

    /// AST 内のすべてのサーフィス番号を抽出する
    pub fn find_surfaces(&self) -> Vec<u32> {
        let mut surfaces = Vec::new();
        self.walk(&mut |node| {
            if let SakuraAstNode::Command(SakuraCommand::Surface(s)) = node {
                surfaces.push(*s);
            }
        });
        surfaces
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

    /// AST 内のすべてのアンカー (id, text) を抽出する
    pub fn find_anchors(&self) -> Vec<(String, String)> {
        let mut anchors = Vec::new();
        self.walk(&mut |node| {
            if let SakuraAstNode::Anchor { id, text, .. } = node {
                anchors.push((id.clone(), text.clone()));
            }
        });
        anchors
    }

    /// AST 内の通常テキストの合計文字数（発話文字数）を算出する
    pub fn calculate_text_length(&self) -> usize {
        let mut length = 0;
        self.walk(&mut |node| match node {
            SakuraAstNode::Command(SakuraCommand::Text(t)) => {
                length += t.chars().count();
            }
            SakuraAstNode::Choice { text, .. } => {
                length += text.chars().count();
            }
            _ => {}
        });
        length
    }

    /// 指定したスコープ（\\0, \\1, \\p[N]）配下のトップレベル子ノード群を取得する
    pub fn scope_nodes(&self, target_scope: u8) -> Vec<&SakuraAstNode> {
        let mut nodes = Vec::new();
        if let SakuraAstNode::Root { children } = self {
            for child in children {
                if let SakuraAstNode::Scope {
                    scope,
                    children: s_children,
                } = child
                    && *scope == target_scope
                {
                    for sc in s_children {
                        nodes.push(sc);
                    }
                }
            }
        } else if let SakuraAstNode::Scope { scope, children } = self
            && *scope == target_scope
        {
            for c in children {
                nodes.push(c);
            }
        }
        nodes
    }

    /// AST 内のすべてのアニメーション呼出 (id, wait) を抽出する
    pub fn find_animations(&self) -> Vec<(u32, bool)> {
        let mut animations = Vec::new();
        self.walk(&mut |node| {
            if let SakuraAstNode::Command(SakuraCommand::Animation { id, wait }) = node {
                animations.push((*id, *wait));
            }
        });
        animations
    }

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

    /// 指定したスコープ（\\0, \\1, \\p[N]）のノードのみを抽出した新しい AST ツリーを生成する
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

    /// ログ保存や早送り再生用にウェイト（\\w, \\_w）コマンドを除去した AST ツリーを再帰生成する
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
    pub fn map_commands(&self, transform: &impl Fn(&SakuraCommand) -> SakuraCommand) -> SakuraAstNode {
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

    /// AST 内の表示用テキストを連結して抽出する（ログ保存・TTS読み上げ用）
    pub fn extract_text(&self) -> String {
        let mut buf = String::new();
        self.walk(&mut |node| match node {
            SakuraAstNode::Command(SakuraCommand::Text(t)) => {
                buf.push_str(t);
            }
            SakuraAstNode::Choice { text, .. } => {
                buf.push_str(text);
            }
            _ => {}
        });
        buf
    }

    /// AST ノードの総数を計算する
    pub fn node_count(&self) -> usize {
        let mut count = 0;
        self.walk(&mut |_| count += 1);
        count
    }

    /// AST ツリーの最大深さを計算する
    pub fn depth(&self) -> usize {
        match self {
            SakuraAstNode::Command(_) | SakuraAstNode::Choice { .. } => 1,
            SakuraAstNode::Scope { children, .. }
            | SakuraAstNode::Anchor { children, .. }
            | SakuraAstNode::Root { children } => {
                if children.is_empty() {
                    1
                } else {
                    1 + children.iter().map(|c| c.depth()).max().unwrap_or(0)
                }
            }
        }
    }
}
