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
