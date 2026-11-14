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

/// 有効テキスト表示領域 (validrect) および背景画像設定からレイアウトを算出
#[allow(clippy::too_many_arguments)]
pub fn compute_validrect_layout(
    validrect_left: Option<i32>,
    validrect_top: Option<i32>,
    validrect_right: Option<i32>,
    validrect_bottom: Option<i32>,
    border_repeat: Option<&str>,
    balloon_image: Option<&str>,
    bg_image_url: Option<&str>,
    scope_id: u32,
) -> ValidRectLayoutResult {
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
#[allow(clippy::too_many_arguments)]
pub fn wasm_compute_validrect_layout(
    validrect_left: Option<i32>,
    validrect_top: Option<i32>,
    validrect_right: Option<i32>,
    validrect_bottom: Option<i32>,
    border_repeat: Option<String>,
    balloon_image: Option<String>,
    bg_image_url: Option<String>,
    scope_id: u32,
) -> Result<JsValue, JsValue> {
    let res = compute_validrect_layout(
        validrect_left,
        validrect_top,
        validrect_right,
        validrect_bottom,
        border_repeat.as_deref(),
        balloon_image.as_deref(),
        bg_image_url.as_deref(),
        scope_id,
    );
    Ok(serde_wasm_bindgen::to_value(&res)?)
}

/// バルーン内テキストの自動改行・レイアウトサイズ計算
pub fn compute_balloon_text_layout(
    text: &str,
    max_container_width: f32,
    font_size_px: f32,
    line_height_px: f32,
    padding_x: f32,
) -> BalloonLayoutResult {
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
pub fn wasm_compute_balloon_text_layout(
    text: &str,
    max_width: f32,
    font_size: f32,
    line_height: f32,
    padding_x: f32,
) -> Result<JsValue, JsValue> {
    let res = compute_balloon_text_layout(text, max_width, font_size, line_height, padding_x);
    Ok(serde_wasm_bindgen::to_value(&res)?)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_compute_balloon_text_layout_basic() {
        let text = "こんにちは\n世界";
        let res = compute_balloon_text_layout(text, 200.0, 16.0, 20.0, 10.0);

        assert_eq!(res.line_count, 2);
        assert_eq!(res.lines[0].text, "こんにちは");
        assert_eq!(res.lines[1].text, "世界");
        assert_eq!(res.total_height_px, 40.0);
    }

    #[test]
    fn test_compute_balloon_text_layout_word_wrap() {
        let text = "あいうえおかきくけこさしすせそ";
        // 180px - padding 20px = 160px. font 16px -> 1行10文字 -> 計2行に折れる
        let res = compute_balloon_text_layout(text, 180.0, 16.0, 20.0, 10.0);

        assert_eq!(res.line_count, 2);
        assert_eq!(res.lines[0].text, "あいうえおかきくけこ");
        assert_eq!(res.lines[1].text, "さしすせそ");
    }
}
