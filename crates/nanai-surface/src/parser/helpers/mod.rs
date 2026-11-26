//! `surfaces.txt` パーサー補助関数・ブロック行ハンドラー

mod blocks;
mod lines;

pub(super) use blocks::{BlockKind, parse_block_opener, prepare_block};
pub(super) use lines::dispatch_scope_line;
