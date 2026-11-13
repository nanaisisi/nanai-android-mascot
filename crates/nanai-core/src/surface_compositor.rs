//! サーフィス合成 & レイヤーカスケード計算エンジン (UKADOC / SSP 準拠)

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct SurfaceElement {
    pub id: u32,
    pub file: String,
    pub method: String, // overlay, base, add, replace, move
    pub x: i32,
    pub y: i32,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
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

// WASM C-ABI Export
/// # Safety
/// `elements_ptr` must be a valid pointer to bytes of length `elements_len`, and `binds_ptr` must be a valid pointer of length `binds_len` if non-null.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn wasm_compute_surface_composition_plan_json(
    surface_id: u32,
    elements_ptr: *const u8,
    elements_len: usize,
    binds_ptr: *const u32,
    binds_len: usize,
) -> u64 {
    if elements_ptr.is_null() || elements_len == 0 {
        return 0;
    }

    let elem_slice = unsafe { std::slice::from_raw_parts(elements_ptr, elements_len) };
    let binds = if !binds_ptr.is_null() && binds_len > 0 {
        unsafe { std::slice::from_raw_parts(binds_ptr, binds_len) }
    } else {
        &[]
    };

    if let Ok(json_str) = std::str::from_utf8(elem_slice)
        && let Ok(elements) = serde_json::from_str::<Vec<SurfaceElement>>(json_str)
    {
        let plan = compute_surface_composition_plan(surface_id, &elements, binds);
        if let Ok(res_json) = serde_json::to_string(&plan) {
            let bytes = res_json.into_bytes();
            let len = bytes.len();
            let ptr = crate::wasm_alloc(len);
            unsafe {
                std::ptr::copy_nonoverlapping(bytes.as_ptr(), ptr, len);
            }
            return ((ptr as u64) << 32) | (len as u64);
        }
    }
    0
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
