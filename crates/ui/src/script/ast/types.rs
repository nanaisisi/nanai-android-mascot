use serde::{Deserialize, Serialize};

use crate::script::command::{SakuraCommand, SakuraScriptLifetime};

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
}
