//! `surfaces.txt` パーサー WASM C-ABI / WASM バインディング

use super::core::parse_surfaces_txt;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn wasm_parse_surfaces_txt(text: &str) -> Result<JsValue, JsValue> {
    let manifest = parse_surfaces_txt(text);
    Ok(serde_wasm_bindgen::to_value(&manifest)?)
}
