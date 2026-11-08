//! `surfaces.txt` メインパーサー関数

use super::helpers::{
    BlockKind, handle_alias_line, handle_char_alias_line, handle_cursor_line,
    handle_descript_line, handle_root_line, handle_surface_line, handle_tooltip_line,
    parse_block_opener, prepare_block,
};
use crate::surfaces::types::SurfacesTxt;

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

        match &scope {
            Some(BlockKind::Descript) => handle_descript_line(&mut txt, line),
            Some(BlockKind::Alias { kero }) => handle_alias_line(&mut txt, *kero, line),
            Some(BlockKind::CharAlias { char_id }) => {
                handle_char_alias_line(&mut txt, *char_id, line)
            }
            Some(BlockKind::Surface { ids, .. }) => {
                let ids = ids.clone();
                handle_surface_line(&mut txt, &ids, line);
            }
            Some(BlockKind::Cursor { scope }) => handle_cursor_line(&mut txt, scope, line),
            Some(BlockKind::Tooltip { scope }) => handle_tooltip_line(&mut txt, scope, line),
            None => handle_root_line(&mut txt, line),
        }
    }

    txt
}
