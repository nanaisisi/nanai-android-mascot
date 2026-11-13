//! サーフィス合成 & レイヤーカスケード計算エンジン (UKADOC / SSP 準拠)

use serde::{Deserialize, Serialize};
use tsify::Tsify;
use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct SurfaceElement {
    pub id: u32,
    pub file: String,
    pub method: String, // overlay, base, add, replace, move
    pub x: i32,
    pub y: i32,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct SurfaceCompositionPlan {
    pub surface_id: u32,
    pub base_file: String,
    pub layers: Vec<SurfaceElement>,
}

/// 指定サーフィス番号および有効バインド情報から最適な描画レイヤー順序パッチを計算
pub fn compute_surface_composition_plan(
    surface_id: u32,
    elements: &[SurfaceElement],
    active_bind_ids: &[u32],
) -> SurfaceCompositionPlan {
    let mut layers = Vec::new();
    let mut base_file = format!("surface{}.png", surface_id);

    for elem in elements {
        if elem.method == "base" {
            base_file = elem.file.clone();
            continue;
        }

        if !active_bind_ids.is_empty() && !active_bind_ids.contains(&elem.id) {
            continue;
        }

        layers.push(elem.clone());
    }

    layers.sort_by_key(|e| e.id);

    SurfaceCompositionPlan {
        surface_id,
        base_file,
        layers,
    }
}

#[wasm_bindgen]
pub fn wasm_compute_surface_composition_plan(
    surface_id: u32,
    elements_js: JsValue,
    binds_js: JsValue,
) -> Result<JsValue, JsValue> {
    let elements: Vec<SurfaceElement> = serde_wasm_bindgen::from_value(elements_js)?;
    let binds: Vec<u32> = if binds_js.is_null() || binds_js.is_undefined() {
        vec![]
    } else {
        serde_wasm_bindgen::from_value(binds_js)?
    };

    let plan = compute_surface_composition_plan(surface_id, &elements, &binds);
    Ok(serde_wasm_bindgen::to_value(&plan)?)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_compute_surface_composition_plan_basic() {
        let elements = vec![
            SurfaceElement {
                id: 0,
                file: "surface0.png".to_string(),
                method: "base".to_string(),
                x: 0,
                y: 0,
            },
            SurfaceElement {
                id: 1,
                file: "eye.png".to_string(),
                method: "overlay".to_string(),
                x: 10,
                y: 20,
            },
        ];

        let plan = compute_surface_composition_plan(0, &elements, &[]);
        assert_eq!(plan.surface_id, 0);
        assert_eq!(plan.base_file, "surface0.png");
        assert_eq!(plan.layers.len(), 1);
        assert_eq!(plan.layers[0].file, "eye.png");
    }

    #[test]
    fn test_compute_surface_composition_plan_with_binds() {
        let elements = vec![
            SurfaceElement {
                id: 1,
                file: "hat.png".to_string(),
                method: "overlay".to_string(),
                x: 0,
                y: 0,
            },
            SurfaceElement {
                id: 2,
                file: "ribbon.png".to_string(),
                method: "overlay".to_string(),
                x: 5,
                y: 5,
            },
        ];

        let plan = compute_surface_composition_plan(0, &elements, &[2]);
        assert_eq!(plan.layers.len(), 1);
        assert_eq!(plan.layers[0].file, "ribbon.png");
    }
}
