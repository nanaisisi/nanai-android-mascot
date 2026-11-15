//! AST ツリーの文字数、ノード数、深度計算処理

use crate::script::ast::types::node::SakuraAstNode;
use crate::script::command::SakuraCommand;

impl SakuraAstNode {
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
