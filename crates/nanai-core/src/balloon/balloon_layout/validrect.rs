//! 有効テキスト表示領域 (validrect) レイアウト計算および WASM バインディング

use super::types::ValidRectLayoutResult;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[allow(non_camel_case_types)]
pub struct Compute_validrect_layoutParams<'a> {
    pub(crate) validrect_left: Option<i32>,
    pub(crate) validrect_top: Option<i32>,
    pub(crate) validrect_right: Option<i32>,
    pub(crate) validrect_bottom: Option<i32>,
    pub(crate) border_repeat: Option<&'a str>,
    pub(crate) balloon_image: Option<&'a str>,
    pub(crate) bg_image_url: Option<&'a str>,
    pub(crate) scope_id: u32,
}

#[allow(dead_code)]
impl<'a> Compute_validrect_layoutParams<'a> {
    pub fn validrect_left(&self) -> Option<i32> {
        self.validrect_left
    }
    pub fn validrect_top(&self) -> Option<i32> {
        self.validrect_top
    }
    pub fn validrect_right(&self) -> Option<i32> {
        self.validrect_right
    }
    pub fn validrect_bottom(&self) -> Option<i32> {
        self.validrect_bottom
    }
    pub fn border_repeat(&self) -> Option<&'a str> {
        self.border_repeat
    }
    pub fn balloon_image(&self) -> Option<&'a str> {
        self.balloon_image
    }
    pub fn bg_image_url(&self) -> Option<&'a str> {
        self.bg_image_url
    }
    pub fn scope_id(&self) -> u32 {
        self.scope_id
    }
}

/// 有効テキスト表示領域 (validrect) および背景画像設定からレイアウトを算出
pub fn compute_validrect_layout(
    params: Compute_validrect_layoutParams<'_>,
) -> ValidRectLayoutResult {
    let validrect_left = params.validrect_left();
    let validrect_top = params.validrect_top();
    let validrect_right = params.validrect_right();
    let validrect_bottom = params.validrect_bottom();
    let border_repeat = params.border_repeat();
    let balloon_image = params.balloon_image();
    let bg_image_url = params.bg_image_url();
    let scope_id = params.scope_id();

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
