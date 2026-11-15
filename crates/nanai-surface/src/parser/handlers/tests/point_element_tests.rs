use super::super::*;
use crate::types::SurfacesTxt;

#[test]
fn test_apply_point_all_fields() {
    let mut txt = SurfacesTxt::default();
    for field in [
        "centerx",
        "centery",
        "basepos.x",
        "basepos.y",
        "kinoko.centerx",
        "kinoko.centery",
        "unknown",
    ] {
        apply_point(Apply_pointParams {
            txt: &mut txt,
            ids: &[0],
            field,
            value: "100",
        });
    }
    let points = &txt.surfaces.get(&0).unwrap().points;
    assert_eq!(points.center_x, Some(100));
    assert_eq!(points.center_y, Some(100));
    assert_eq!(points.basepos_x, Some(100));
    assert_eq!(points.basepos_y, Some(100));
    assert_eq!(points.kinoko_center_x, Some(100));
    assert_eq!(points.kinoko_center_y, Some(100));
}
