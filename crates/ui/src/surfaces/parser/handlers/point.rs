//! 基準点 (`point`) ハンドラー

use crate::surfaces::types::*;
use super::utils::first_i32;

pub(crate) fn apply_point(txt: &mut SurfacesTxt, ids: &[u32], field: &str, value: &str) {
    let parsed = first_i32(value);
    for num in ids {
        let points = &mut txt.surfaces.entry(*num).or_default().points;
        match field {
            "centerx" => points.center_x = parsed,
            "centery" => points.center_y = parsed,
            "basepos.x" => points.basepos_x = parsed,
            "basepos.y" => points.basepos_y = parsed,
            "kinoko.centerx" => points.kinoko_center_x = parsed,
            "kinoko.centery" => points.kinoko_center_y = parsed,
            _ => {}
        }
    }
}
