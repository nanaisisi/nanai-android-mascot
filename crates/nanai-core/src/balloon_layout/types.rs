//! バルーンレイアウト・メトリクス計算結果データモデル

use serde::{Deserialize, Serialize};
use tsify::Tsify;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct TextLayoutLine {
    pub line_number: u32,
    pub text: String,
    pub width_px: f32,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct BalloonLayoutResult {
    pub lines: Vec<TextLayoutLine>,
    pub total_height_px: f32,
    pub max_width_px: f32,
    pub line_count: u32,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct ValidRectLayoutResult {
    pub source: String,
    pub slice: String,
    pub width: String,
    pub repeat: String,
    #[serde(rename = "cssBorderImage")]
    pub css_border_image: String,
    #[serde(rename = "scopeId")]
    pub scope_id: u32,
    #[serde(rename = "cacheKey")]
    pub cache_key: String,
}
