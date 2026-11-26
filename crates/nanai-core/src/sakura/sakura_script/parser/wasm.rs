//! さくらスクリプト パーサー WASM C-ABI / WASM バインディング

use super::core::parse_sakura_script;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn wasm_parse_sakura_script(script: &str) -> Result<JsValue, JsValue> {
    let tokens = parse_sakura_script(script);
    Ok(serde_wasm_bindgen::to_value(&tokens)?)
}
