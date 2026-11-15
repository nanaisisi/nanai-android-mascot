//! バルーンテキスト自動折り返し & レイアウトメトリクス演算エンジン (UKADOC / SSP 準拠)

use serde::{Deserialize, Serialize};
use tsify::Tsify;
use wasm_bindgen::prelude::*;

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

#[allow(non_camel_case_types)]
pub struct Compute_validrect_layoutParams<'a> {
    pub validrect_left: Option<i32>,
    pub validrect_top: Option<i32>,
    pub validrect_right: Option<i32>,
    pub validrect_bottom: Option<i32>,
    pub border_repeat: Option<&'a str>,
    pub balloon_image: Option<&'a str>,
    pub bg_image_url: Option<&'a str>,
    pub scope_id: u32,
}

/// 有効テキスト表示領域 (validrect) および背景画像設定からレイアウトを算出
pub fn compute_validrect_layout(
    params: Compute_validrect_layoutParams<'_>,
) -> ValidRectLayoutResult {
    let validrect_left = params.validrect_left;
    let validrect_top = params.validrect_top;
    let validrect_right = params.validrect_right;
    let validrect_bottom = params.validrect_bottom;
    let border_repeat = params.border_repeat;
    let balloon_image = params.balloon_image;
    let bg_image_url = params.bg_image_url;
    let scope_id = params.scope_id;

    let t = validrect_top.filter(|&v| v >= 0).map_or(16, |v| v.max(8));
    let r = validrect_right.filter(|&v| v >= 0).map_or(16, |v| v.max(8));
    let b = validrect_bottom
        .filter(|&v| v >= 0)
        .map_or(16, |v| v.max(8));
    let l = validrect_left.filter(|&v| v >= 0).map_or(16, |v| v.max(8));

    let repeat = border_repeat.unwrap_or("repeat");
    let source = bg_image_url.or(balloon_image).unwrap_or("");

    let cache_key = if scope_id > 0 {
        format!(
            "scope{}_{}_{}_{}_{}_{}_{}",
            scope_id, t, r, b, l, repeat, source
        )
    } else {
        format!("{}_{}_{}_{}_{}_{}", t, r, b, l, repeat, source)
    };

    let slice = format!("{} {} {} {} fill", t, r, b, l);
    let width = format!("{}px {}px {}px {}px", t, r, b, l);

    let css_border_image = if !source.is_empty() {
        format!(
            "url(\"{}\") {} {} {} {} fill / {} {}",
            source, t, r, b, l, width, repeat
        )
    } else {
        String::new()
    };

    ValidRectLayoutResult {
        source: source.to_string(),
        slice,
        width,
        repeat: repeat.to_string(),
        css_border_image,
        scope_id,
        cache_key,
    }
}

#[wasm_bindgen]
#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(non_camel_case_types)]
pub struct Wasm_compute_validrect_layoutParams {
    validrect_left: Option<i32>,
    validrect_top: Option<i32>,
    validrect_right: Option<i32>,
    validrect_bottom: Option<i32>,
    border_repeat: Option<String>,
    balloon_image: Option<String>,
    bg_image_url: Option<String>,
    scope_id: u32,
}

#[wasm_bindgen]
impl Wasm_compute_validrect_layoutParams {
    #[wasm_bindgen(constructor)]
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        validrect_left: Option<i32>,
        validrect_top: Option<i32>,
        validrect_right: Option<i32>,
        validrect_bottom: Option<i32>,
        border_repeat: Option<String>,
        balloon_image: Option<String>,
        bg_image_url: Option<String>,
        scope_id: u32,
    ) -> Self {
        Self {
            validrect_left,
            validrect_top,
            validrect_right,
            validrect_bottom,
            border_repeat,
            balloon_image,
            bg_image_url,
            scope_id,
        }
    }
}

#[wasm_bindgen]
pub fn wasm_compute_validrect_layout(
    params: &Wasm_compute_validrect_layoutParams,
) -> Result<JsValue, JsValue> {
    let res = compute_validrect_layout(Compute_validrect_layoutParams {
        validrect_left: params.validrect_left,
        validrect_top: params.validrect_top,
        validrect_right: params.validrect_right,
        validrect_bottom: params.validrect_bottom,
        border_repeat: params.border_repeat.as_deref(),
        balloon_image: params.balloon_image.as_deref(),
        bg_image_url: params.bg_image_url.as_deref(),
        scope_id: params.scope_id,
    });
    Ok(serde_wasm_bindgen::to_value(&res)?)
}

#[allow(non_camel_case_types)]
pub struct Compute_balloon_text_layoutParams<'a> {
    pub text: &'a str,
    pub max_container_width: f32,
    pub font_size_px: f32,
    pub line_height_px: f32,
    pub padding_x: f32,
}

/// バルーン内テキストの自動改行・レイアウトサイズ計算
pub fn compute_balloon_text_layout(
    params: Compute_balloon_text_layoutParams<'_>,
) -> BalloonLayoutResult {
    let text = params.text;
    let max_container_width = params.max_container_width;
    let font_size_px = params.font_size_px;
    let line_height_px = params.line_height_px;
    let padding_x = params.padding_x;

    let available_width = (max_container_width - padding_x * 2.0).max(10.0);
    let mut lines = Vec::new();
    let mut current_line = String::new();
    let mut current_line_width = 0.0;
    let mut max_width_px: f32 = 0.0;

    let ascii_char_width = font_size_px * 0.55;
    let full_char_width = font_size_px;

    for ch in text.chars() {
        if ch == '\n' {
            max_width_px = max_width_px.max(current_line_width);
            lines.push(TextLayoutLine {
                line_number: lines.len() as u32,
                text: std::mem::take(&mut current_line),
                width_px: current_line_width,
            });
            current_line_width = 0.0;
            continue;
        }

        let w = if ch.is_ascii() {
            ascii_char_width
        } else {
            full_char_width
        };

        if current_line_width + w > available_width && !current_line.is_empty() {
            max_width_px = max_width_px.max(current_line_width);
            lines.push(TextLayoutLine {
                line_number: lines.len() as u32,
                text: std::mem::take(&mut current_line),
                width_px: current_line_width,
            });
            current_line_width = 0.0;
        }

        current_line.push(ch);
        current_line_width += w;
    }

    if !current_line.is_empty() || lines.is_empty() {
        max_width_px = max_width_px.max(current_line_width);
        lines.push(TextLayoutLine {
            line_number: lines.len() as u32,
            text: current_line,
            width_px: current_line_width,
        });
    }

    let line_count = lines.len() as u32;
    let total_height_px = line_count as f32 * line_height_px;

    BalloonLayoutResult {
        lines,
        total_height_px,
        max_width_px,
        line_count,
    }
}

#[wasm_bindgen]
#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(non_camel_case_types)]
pub struct Wasm_compute_balloon_text_layoutParams {
    text: String,
    max_width: f32,
    font_size: f32,
    line_height: f32,
    padding_x: f32,
}

#[wasm_bindgen]
impl Wasm_compute_balloon_text_layoutParams {
    #[wasm_bindgen(constructor)]
    pub fn new(
        text: String,
        max_width: f32,
        font_size: f32,
        line_height: f32,
        padding_x: f32,
    ) -> Self {
        Self {
            text,
            max_width,
            font_size,
            line_height,
            padding_x,
        }
    }
}

#[wasm_bindgen]
pub fn wasm_compute_balloon_text_layout(
    params: &Wasm_compute_balloon_text_layoutParams,
) -> Result<JsValue, JsValue> {
    let res = compute_balloon_text_layout(Compute_balloon_text_layoutParams {
        text: &params.text,
        max_container_width: params.max_width,
        font_size_px: params.font_size,
        line_height_px: params.line_height,
        padding_x: params.padding_x,
    });
    Ok(serde_wasm_bindgen::to_value(&res)?)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_compute_balloon_text_layout_basic() {
        let text = "こんにちは\n世界";
        let res = compute_balloon_text_layout(Compute_balloon_text_layoutParams {
            text,
            max_container_width: 200.0,
            font_size_px: 16.0,
            line_height_px: 20.0,
            padding_x: 10.0,
        });

        assert_eq!(res.line_count, 2);
        assert_eq!(res.lines[0].text, "こんにちは");
        assert_eq!(res.lines[1].text, "世界");
        assert_eq!(res.total_height_px, 40.0);
    }

    #[test]
    fn test_compute_balloon_text_layout_word_wrap() {
        let text = "あいうえおかきくけこさしすせそ";
        // 180px - padding 20px = 160px. font 16px -> 1行10文字 -> 計2行に折れる
        let res = compute_balloon_text_layout(Compute_balloon_text_layoutParams {
            text,
            max_container_width: 180.0,
            font_size_px: 16.0,
            line_height_px: 20.0,
            padding_x: 10.0,
        });

        assert_eq!(res.line_count, 2);
        assert_eq!(res.lines[0].text, "あいうえおかきくけこ");
        assert_eq!(res.lines[1].text, "さしすせそ");
    }
}
