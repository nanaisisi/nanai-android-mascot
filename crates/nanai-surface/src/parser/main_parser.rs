//! `surfaces.txt` メインパーサー関数

use super::helpers::{BlockKind, dispatch_scope_line, parse_block_opener, prepare_block};
use crate::types::SurfacesTxt;

/// テキスト内容から `surfaces.txt` をパースする
pub fn parse_surfaces_txt(text: &str) -> SurfacesTxt {
    let mut txt = SurfacesTxt::default();
    let mut scope: Option<BlockKind> = None;

    for raw in text.lines() {
        let line = raw.trim();
        if line.is_empty() || line.starts_with("//") {
            continue;
        }

        // ブロックの開始 brace（単独行）
        if line == "{" {
            continue;
        }
        if line == "}" {
            scope = None;
            continue;
        }

        // ブロック開始行の検出（scope にいない場合のみ）
        if scope.is_none()
            && let Some(kind) = parse_block_opener(line)
        {
            prepare_block(&mut txt, &kind);
            scope = Some(kind);
            continue;
        }

        dispatch_scope_line(&mut txt, &scope, line);
    }

    txt
}

impl SurfacesTxt {
    /// テキスト内容から `surfaces.txt` をパースする
    pub fn parse(text: &str) -> Self {
        parse_surfaces_txt(text)
    }
}
