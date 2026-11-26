//! バルーン内テキストの自動改行・レイアウト演算および WASM バインディング

use super::types::{BalloonLayoutResult, TextLayoutLine};
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[allow(non_camel_case_types)]
pub struct Compute_balloon_text_layoutParams<'a> {
    pub(crate) text: &'a str,
    pub(crate) max_container_width: f32,
    pub(crate) font_size_px: f32,
    pub(crate) line_height_px: f32,
    pub(crate) padding_x: f32,
}

#[allow(dead_code)]
impl<'a> Compute_balloon_text_layoutParams<'a> {
    pub fn text(&self) -> &'a str {
        self.text
    }
    pub fn max_container_width(&self) -> f32 {
        self.max_container_width
    }
    pub fn font_size_px(&self) -> f32 {
        self.font_size_px
    }
    pub fn line_height_px(&self) -> f32 {
        self.line_height_px
    }
    pub fn padding_x(&self) -> f32 {
        self.padding_x
    }
}

/// バルーン内テキストの自動改行・レイアウトサイズ計算
pub fn compute_balloon_text_layout(
    params: Compute_balloon_text_layoutParams<'_>,
) -> BalloonLayoutResult {
    let text = params.text();
    let max_container_width = params.max_container_width();
    let font_size_px = params.font_size_px();
    let line_height_px = params.line_height_px();
    let padding_x = params.padding_x();

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
