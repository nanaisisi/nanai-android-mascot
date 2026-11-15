//! 基準点 (`point`) ハンドラー

use super::utils::first_i32;
use crate::types::*;

#[allow(non_camel_case_types)]
pub struct Apply_pointParams<'a> {
    pub(crate) txt: &'a mut SurfacesTxt,
    pub(crate) ids: &'a [u32],
    pub(crate) field: &'a str,
    pub(crate) value: &'a str,
}

#[allow(dead_code)]
impl<'a> Apply_pointParams<'a> {
    // Add getter methods
    pub fn txt(&mut self) -> &mut SurfacesTxt {
        self.txt
    }
    pub fn ids(&self) -> &'a [u32] {
        self.ids
    }
    pub fn field(&self) -> &'a str {
        self.field
    }
    pub fn value(&self) -> &'a str {
        self.value
    }
}

pub(crate) fn apply_point(mut params: Apply_pointParams<'_>) {
    let field = params.field().to_string();
    let value = params.value().to_string();
    let ids = params.ids().to_vec();

    let parsed = first_i32(&value);
    let field_lower = field.to_lowercase();
    let f = field_lower.strip_prefix("point.").unwrap_or(&field_lower);
    let txt = params.txt();
    for num in &ids {
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
