//! 合成計画 (MAYUNA) の型

use serde::{Deserialize, Serialize};

use super::surface::{AnimationPattern, ElementDef};

/// 合成計画の1レイヤー
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum CompositionLayer {
    /// surface ブロックの element（base / overlay 等）
    Element(ElementDef),
    /// 装着された着せ替え（bind）アニメーションの pattern
    Pattern(AnimationPattern),
}

/// `SurfacesTxt::plan_composition` の結果（下から上への描画順）
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CompositionPlan {
    /// 対象サーフィス番号
    pub surface: u32,
    /// 描画順に並んだレイヤー列
    pub layers: Vec<CompositionLayer>,
}

impl CompositionPlan {
    /// レイヤーの参照列（表示ファイル名と描画地点の確認用）
    pub fn layer_files(&self) -> Vec<String> {
        self.layers
            .iter()
            .map(|l| match l {
                CompositionLayer::Element(e) => e.file.clone(),
                CompositionLayer::Pattern(p) => p.surface.to_string(),
            })
            .collect()
    }

    /// 装着 pattern レイヤーの数
    pub fn bind_pattern_count(&self) -> usize {
        self.layers
            .iter()
            .filter(|l| matches!(l, CompositionLayer::Pattern(_)))
            .count()
    }
}
