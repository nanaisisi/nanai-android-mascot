//! バルーンレイアウト・メトリクス計算結果データモデル

use serde::{Deserialize, Serialize};
use tsify::Tsify;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct TextLayoutLine {
    pub(crate) line_number: u32,
    pub(crate) text: String,
    pub(crate) width_px: f32,
}

impl TextLayoutLine {
    pub fn line_number(&self) -> u32 {
        self.line_number
    }

    pub fn text(&self) -> &str {
        &self.text
    }

    pub fn width_px(&self) -> f32 {
        self.width_px
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct BalloonLayoutResult {
    pub(crate) lines: Vec<TextLayoutLine>,
    pub(crate) total_height_px: f32,
    pub(crate) max_width_px: f32,
    pub(crate) line_count: u32,
}

impl BalloonLayoutResult {
    pub fn lines(&self) -> &[TextLayoutLine] {
        &self.lines
    }

    pub fn total_height_px(&self) -> f32 {
        self.total_height_px
    }

    pub fn max_width_px(&self) -> f32 {
        self.max_width_px
    }

    pub fn line_count(&self) -> u32 {
        self.line_count
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct ValidRectLayoutResult {
    pub(crate) source: String,
    pub(crate) slice: String,
    pub(crate) width: String,
    pub(crate) repeat: String,
    #[serde(rename = "cssBorderImage")]
    pub(crate) css_border_image: String,
    #[serde(rename = "scopeId")]
    pub(crate) scope_id: u32,
    #[serde(rename = "cacheKey")]
    pub(crate) cache_key: String,
}

impl ValidRectLayoutResult {
    pub fn source(&self) -> &str {
        &self.source
    }

    pub fn slice(&self) -> &str {
        &self.slice
    }

    pub fn width(&self) -> &str {
        &self.width
    }

    pub fn repeat(&self) -> &str {
        &self.repeat
    }

    pub fn css_border_image(&self) -> &str {
        &self.css_border_image
    }

    pub fn scope_id(&self) -> u32 {
        self.scope_id
    }

    pub fn cache_key(&self) -> &str {
        &self.cache_key
    }
}
