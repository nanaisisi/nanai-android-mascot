//! SERIKO アニメーション制御 & コマ送りタイミング計算エンジン (UKADOC / SSP 準拠)

use serde::{Deserialize, Serialize};
use tsify::Tsify;
use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct AnimationPattern {
    pub surface_id: i32,
    pub wait_ms: u32,
    pub method: String, // overlay, base, add, replace, move
    pub x: i32,
    pub y: i32,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct AnimationDefinition {
    pub id: u32,
    pub interval: String, // sometimes, rarely, always, runagain, bind, never
    pub patterns: Vec<AnimationPattern>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct AnimationState {
    pub animation_id: u32,
    pub current_pattern_index: usize,
    pub elapsed_ms: u32,
    pub is_running: bool,
}

/// 経過ミリ秒 (delta_ms) に応じてアニメーション状態を更新し、現在のコマ領域を返却
pub fn advance_animation_frame(
    def: &AnimationDefinition,
    state: &mut AnimationState,
    delta_ms: u32,
) -> Option<AnimationPattern> {
    if !state.is_running || def.patterns.is_empty() {
        return None;
    }

    state.elapsed_ms += delta_ms;

    let mut current_pattern = &def.patterns[state.current_pattern_index];
    if state.elapsed_ms >= current_pattern.wait_ms {
        state.elapsed_ms = 0;
        state.current_pattern_index += 1;

        if state.current_pattern_index >= def.patterns.len() {
            if def.interval == "runagain" || def.interval == "always" {
                state.current_pattern_index = 0;
            } else {
                state.is_running = false;
                return None;
            }
        }
        current_pattern = &def.patterns[state.current_pattern_index];
    }

    Some(current_pattern.clone())
}

#[wasm_bindgen]
pub fn wasm_advance_animation_frame(
    def_js: JsValue,
    state_js: JsValue,
    delta_ms: u32,
) -> Result<JsValue, JsValue> {
    let def: AnimationDefinition = serde_wasm_bindgen::from_value(def_js)?;
    let mut state: AnimationState = serde_wasm_bindgen::from_value(state_js)?;

    let opt_pat = advance_animation_frame(&def, &mut state, delta_ms);
    let payload = (opt_pat, state);
    Ok(serde_wasm_bindgen::to_value(&payload)?)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_advance_animation_frame_basic() {
        let def = AnimationDefinition {
            id: 0,
            interval: "never".to_string(),
            patterns: vec![
                AnimationPattern {
                    surface_id: 10,
                    wait_ms: 100,
                    method: "overlay".to_string(),
                    x: 0,
                    y: 0,
                },
                AnimationPattern {
                    surface_id: 11,
                    wait_ms: 100,
                    method: "overlay".to_string(),
                    x: 0,
                    y: 0,
                },
            ],
        };

        let mut state = AnimationState {
            animation_id: 0,
            current_pattern_index: 0,
            elapsed_ms: 0,
            is_running: true,
        };

        // 50ms 進行: 最初のパターン維持
        let pat1 = advance_animation_frame(&def, &mut state, 50);
        assert_eq!(pat1.unwrap().surface_id, 10);
        assert_eq!(state.current_pattern_index, 0);

        // さらに 60ms 進行 (計110ms): 次のコマ (index 1, surface_id 11) へコマ送り
        let pat2 = advance_animation_frame(&def, &mut state, 60);
        assert_eq!(pat2.unwrap().surface_id, 11);
        assert_eq!(state.current_pattern_index, 1);
    }
}
