//! AST ノード要素（コマンド、選択肢、サーフィス、アンカー、テキスト）の検索・抽出処理

use crate::script::ast::types::node::SakuraAstNode;
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

    /// 指定したスコープ（\0, \1, \p[N]）配下のトップレベル子ノード群を取得する
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
}
