//! さくらスクリプト AST ノード定義および深さ優先走査モジュール

use crate::script::command::SakuraCommand;
use serde::{Deserialize, Serialize};

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
}
