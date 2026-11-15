//! 基準点 (`point`) ハンドラー

use super::utils::first_i32;
use crate::types::*;

#[allow(non_camel_case_types)]
pub struct Apply_pointParams<'a> {
    pub txt: &'a mut SurfacesTxt,
    pub ids: &'a [u32],
    pub field: &'a str,
    pub value: &'a str,
}

pub(crate) fn apply_point(params: Apply_pointParams<'_>) {
    let txt = params.txt;
    let ids = params.ids;
    let field = params.field;
    let value = params.value;

    let parsed = first_i32(value);
    let field_lower = field.to_lowercase();
    let f = field_lower.strip_prefix("point.").unwrap_or(&field_lower);
    for num in ids {
        let points = &mut txt.surfaces.entry(*num).or_default().points;
        match f {
            "centerx" | "center.x" => points.center_x = parsed,
            "centery" | "center.y" => points.center_y = parsed,
            "basepos.x" | "baseposx" => points.basepos_x = parsed,
            "basepos.y" | "baseposy" => points.basepos_y = parsed,
            "kinoko.centerx" | "kinoko.center.x" => points.kinoko_center_x = parsed,
            "kinoko.centery" | "kinoko.center.y" => points.kinoko_center_y = parsed,
            _ => {}
        }
    }
}
