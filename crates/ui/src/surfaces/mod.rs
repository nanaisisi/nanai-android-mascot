//! `surfaces.txt` パーサー（ukadoc-spec / descript / shell-surfaces 準拠）
//!
//! シェルのサーフィス定義（Element 描画 / SERIKO アニメーション / Collision 当たり判定 /
//! Alias・範囲指定・surface.append マージ）を Rust 構造体群へとパースする。
//! パーサーはテキスト評価のみを担当し、描画・アニメーション再生は UI 実装側が行う。

pub mod parser;
pub mod types;

#[cfg(test)]
mod tests;

pub use parser::{expand_range, parse_surfaces_txt};
pub use types::{
    AnimationPattern, BalloonOffset, CollisionArea, CollisionShape, CompositionLayer,
    CompositionPlan, DrawMethod, ElementDef, Interval, Points, SerikoAnimation, SortKind,
    SurfaceDefinition, SurfacesTxt,
};
