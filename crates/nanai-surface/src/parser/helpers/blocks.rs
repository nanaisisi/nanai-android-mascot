//! `surfaces.txt` パーサー補助関数・ブロック判定

use crate::parser::handlers::expand_range;
use crate::types::{SurfaceDefinition, SurfacesTxt};

/// ブロック種別
#[derive(Clone, Debug)]
pub(crate) enum BlockKind {
    /// `descript {}` ブロック
    Descript,
    /// `surface.alias {}` / `sakura.surface.alias {}` / `kero.surface.alias {}` ブロック
    Alias { kero: bool },
    /// `char<N>.surface.alias {}` ブロック
    CharAlias { char_id: u32 },
    /// `surface[N...]` / `surface.append[N...]` / `sakura.surface[N...]` ブロック
    Surface { ids: Vec<u32>, append: bool },
    /// `*.cursor {}` ブロック
    Cursor { scope: String },
    /// `*.tooltips {}` ブロック
    Tooltip { scope: String },
}

/// ブロックに入る際の初期化（surface の定義クリア / マージ準備）
pub(crate) fn prepare_block(txt: &mut SurfacesTxt, kind: &BlockKind) {
    if let BlockKind::Surface { ids, append } = kind
        && !*append
    {
        // surface ブロックは既存定義を上書き（append は追記）
        for id in ids {
            txt.surfaces.insert(*id, SurfaceDefinition::default());
        }
    }
}

/// ブロック開始行（`surface[N]` / `surface.append[N]` / `*.surface.alias` / `descript` / `*.cursor` / `*.tooltips`）を判定する
pub(crate) fn parse_block_opener(line: &str) -> Option<BlockKind> {
    let raw = line.trim();

    // *.cursor ブロック
    // 例: sakura.cursor, kero.cursor, char0.cursor, cursor
    for prefix in [
        "sakura.cursor",
        "kero.cursor",
        "char0.cursor",
        "char1.cursor",
        "cursor",
    ] {
        if let Some(rest) = raw.strip_prefix(prefix) {
            let after = rest.trim();
            if after.is_empty() || after == "{" {
                let scope = match prefix {
                    "sakura.cursor" | "char0.cursor" => "sakura",
                    "kero.cursor" | "char1.cursor" => "kero",
                    "cursor" => "*",
                    _ => prefix,
                };
                return Some(BlockKind::Cursor {
                    scope: scope.to_string(),
                });
            }
        }
    }
    if raw.starts_with("char")
        && raw.contains(".cursor")
        && let Some((scope, rest)) = raw.split_once(".cursor")
    {
        let after = rest.trim();
        if after.is_empty() || after == "{" {
            return Some(BlockKind::Cursor {
                scope: scope.to_string(),
            });
        }
    }

    // *.tooltips ブロック
    // 例: sakura.tooltips, kero.tooltips, char0.tooltips, tooltips
    for prefix in [
        "sakura.tooltips",
        "kero.tooltips",
        "char0.tooltips",
        "char1.tooltips",
        "tooltips",
    ] {
        if let Some(rest) = raw.strip_prefix(prefix) {
            let after = rest.trim();
            if after.is_empty() || after == "{" {
                let scope = match prefix {
                    "sakura.tooltips" | "char0.tooltips" => "sakura",
                    "kero.tooltips" | "char1.tooltips" => "kero",
                    "tooltips" => "*",
                    _ => prefix,
                };
                return Some(BlockKind::Tooltip {
                    scope: scope.to_string(),
                });
            }
        }
    }
    if raw.starts_with("char")
        && raw.contains(".tooltips")
        && let Some((scope, rest)) = raw.split_once(".tooltips")
    {
        let after = rest.trim();
        if after.is_empty() || after == "{" {
            return Some(BlockKind::Tooltip {
                scope: scope.to_string(),
            });
        }
    }

    let (stripped_line, kero, char_scope) = match raw {
        l if l.starts_with("sakura.surface") => (&l["sakura.".len()..], false, None),
        l if l.starts_with("kero.surface") => (&l["kero.".len()..], true, None),
        l if l.starts_with("char") => {
            if let Some((id_str, _)) = l["char".len()..].split_once(".surface") {
                if let Ok(cid) = id_str.trim().parse::<u32>() {
                    (
                        l[("char".len() + id_str.len() + 1)..].as_ref(),
                        cid == 1,
                        Some(cid),
                    )
                } else {
                    (l, false, None)
                }
            } else {
                (l, false, None)
            }
        }
        _ => (raw, false, None),
    };
    if let Some(rest) = stripped_line.strip_prefix("surface") {
        let rest = rest.replace(['[', ']'], " ");
        if let Some(spec) = rest.strip_prefix(".append") {
            if spec
                .trim()
                .starts_with(|c: char| c.is_ascii_digit() || c == ',')
            {
                return Some(BlockKind::Surface {
                    ids: expand_range(spec.trim().trim_end_matches('{')),
                    append: true,
                });
            }
            return None;
        }
        if let Some(spec) = rest.strip_prefix(".alias") {
            if spec.trim().is_empty() || spec.trim() == "{" {
                if let Some(cid) = char_scope {
                    return if cid == 0 {
                        Some(BlockKind::Alias { kero: false })
                    } else if cid == 1 {
                        Some(BlockKind::Alias { kero: true })
                    } else {
                        Some(BlockKind::CharAlias { char_id: cid })
                    };
                }
                return Some(BlockKind::Alias { kero });
            }
            return None;
        }
        if rest.strip_prefix('.').is_some() {
            return None;
        }
        let spec = rest.trim();
        if spec.starts_with(|c: char| c.is_ascii_digit() || c == ',') {
            return Some(BlockKind::Surface {
                ids: expand_range(spec.trim_end_matches('{')),
                append: false,
            });
        }
        return None;
    }
    if raw.strip_prefix("descript").is_some() {
        let after = raw["descript".len()..].trim();
        if after.is_empty() || after == "{" {
            return Some(BlockKind::Descript);
        }
    }
    None
}
