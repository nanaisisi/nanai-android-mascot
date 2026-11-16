//! サーフィス合成 & レイヤーカスケード計算エンジン (UKADOC / SSP 準拠)

use serde::{Deserialize, Serialize};
use tsify::Tsify;
use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct SurfaceElement {
    pub(crate) id: u32,
    pub(crate) file: String,
    pub(crate) method: String, // overlay, base, add, replace, move
    pub(crate) x: i32,
    pub(crate) y: i32,
}

impl SurfaceElement {
    pub fn id(&self) -> u32 {
        self.id
    }

    pub fn file(&self) -> &str {
        &self.file
    }

    pub fn method(&self) -> &str {
        &self.method
    }

    pub fn x(&self) -> i32 {
        self.x
    }

    pub fn y(&self) -> i32 {
        self.y
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct SurfaceCompositionPlan {
    pub(crate) surface_id: u32,
    pub(crate) base_file: String,
    pub(crate) layers: Vec<SurfaceElement>,
}

impl SurfaceCompositionPlan {
    pub fn surface_id(&self) -> u32 {
        self.surface_id
    }

    pub fn base_file(&self) -> &str {
        &self.base_file
    }

    pub fn layers(&self) -> &[SurfaceElement] {
        &self.layers
    }
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

/// RGBAピクセルバッファに対する高速クロマキー消去およびPNAアルファチャネル合成処理
pub fn process_chroma_key_data(
    data: &mut [u8],
    width: u32,
    _height: u32,
    pna_data: Option<&[u8]>,
    use_self_alpha: bool,
    paint_black: bool,
) {
    if data.len() < 4 {
        return;
    }

    if !use_self_alpha {
        let target_r = data[0];
        let target_g = data[1];
        let target_b = data[2];

        let tr_idx = ((width as usize).saturating_sub(1)) * 4;
        let (tr_r, tr_g, tr_b) = if tr_idx + 2 < data.len() {
            (data[tr_idx], data[tr_idx + 1], data[tr_idx + 2])
        } else {
            (target_r, target_g, target_b)
        };

        let chunk_count = data.len() / 4;
        for i in 0..chunk_count {
            let idx = i * 4;
            let r = data[idx];
            let g = data[idx + 1];
            let b = data[idx + 2];

            let is_match_top_left = r == target_r && g == target_g && b == target_b;
            let is_match_top_right = r == tr_r && g == tr_g && b == tr_b;
            let is_green_bg =
                g > 130 && (g as f32) > (r as f32) * 1.15 && (g as f32) > (b as f32) * 1.15;

            if is_match_top_left || is_match_top_right || is_green_bg {
                if paint_black {
                    data[idx] = 0;
                    data[idx + 1] = 0;
                    data[idx + 2] = 0;
                } else {
                    data[idx + 3] = 0;
                }
            }
        }
    }

    if let Some(pna) = pna_data {
        let len = data.len().min(pna.len());
        let chunk_count = len / 4;
        for i in 0..chunk_count {
            let idx = i * 4;
            data[idx + 3] = pna[idx];
        }
    }
}

#[wasm_bindgen]
pub fn wasm_process_chroma_key(
    data: &mut [u8],
    width: u32,
    height: u32,
    pna_data: Option<Vec<u8>>,
    use_self_alpha: bool,
    paint_black: bool,
) {
    process_chroma_key_data(
        data,
        width,
        height,
        pna_data.as_deref(),
        use_self_alpha,
        paint_black,
    );
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_process_chroma_key_top_left() {
        // 2x1 pixels: [255, 0, 0, 255], [0, 255, 0, 255]
        let mut data = vec![255, 0, 0, 255, 0, 255, 0, 255];
        process_chroma_key_data(&mut data, 2, 1, None, false, false);
        // Top-left is (255, 0, 0), so pixel 0 alpha becomes 0
        assert_eq!(data[3], 0);
    }

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
        assert_eq!(plan.surface_id(), 0);
        assert_eq!(plan.base_file(), "surface0.png");
        assert_eq!(plan.layers().len(), 1);
        assert_eq!(plan.layers()[0].file(), "eye.png");
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
        assert_eq!(plan.layers().len(), 1);
        assert_eq!(plan.layers()[0].file(), "ribbon.png");
    }
}
