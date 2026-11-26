//! `surfacetable.txt` パーサー（ukadoc-spec / descript / shell-surfacetable 準拠）
//!
//! 「SSP を起動しなくてもサーフィスを確認できるようにするための」仕様であり、
//! シェル自体には不要なファイル。ゴーストのサーフィスを グループ名 / 名前 の
//! 形式で整理する。サーフィス表示系（サーフィステスト・プレビュー）は
//! このパース結果を利用する。

pub mod parser;
pub mod types;

#[cfg(test)]
mod tests;

pub use parser::{is_parts_name, parse_surface_table};
pub use types::{SurfTableEntry, SurfTableGroup, SurfaceTable};

impl SurfaceTable {
    /// テキスト内容から `surfacetable.txt` をパースする
    pub fn parse(text: &str) -> Self {
        parse_surface_table(text)
    }
}
