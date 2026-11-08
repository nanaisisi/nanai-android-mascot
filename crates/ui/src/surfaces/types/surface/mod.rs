//! サーフィス構成要素の型定義モジュール

pub mod definition;
pub mod elements;

#[cfg(test)]
mod tests;

pub use definition::SurfaceDefinition;
pub use elements::{BalloonOffset, ElementDef, Points, SortKind, make_square_rect};

pub use crate::surfaces::types::animation::{AnimationPattern, SerikoAnimation};
