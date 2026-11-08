/**
 * @file tests.rs
 * @brief SurfacesTxt マージ・サーフィスID列挙クエリ単体テスト
 */

use super::definition::SurfacesTxt;
use crate::surfaces::types::surface::{SortKind, SurfaceDefinition};
use crate::surfaces::types::{Interval, SerikoAnimation};

#[test]
fn test_surfaces_txt_merge_comprehensive() {
    let mut base = SurfacesTxt::default();
    base.surfaces.insert(0, SurfaceDefinition::default());

    let mut other = SurfacesTxt {
        charset: Some("UTF-8".into()),
        version: 1,
        maxwidth: Some(800),
        animation_sort: Some(SortKind::Id),
        collision_sort: Some(SortKind::Ascend),
        ..Default::default()
    };

    let mut other_def = SurfaceDefinition {
        name: Some("SurfaceZero".into()),
        ..Default::default()
    };
    other_def.points.center_x = Some(10);
    other_def.points.center_y = Some(20);
    other_def.points.basepos_x = Some(30);
    other_def.points.basepos_y = Some(40);
    other_def.points.kinoko_center_x = Some(50);
    other_def.points.kinoko_center_y = Some(60);

    let anim = SerikoAnimation {
        id: 0,
        name: Some("Anim0".into()),
        interval: Some(Interval::Always),
        options: vec![],
        collisions: vec![],
        patterns: vec![],
    };
    other_def.animations.insert(0, anim.clone());
    other.surfaces.insert(0, other_def);

    let other_def1 = SurfaceDefinition::default();
    other.surfaces.insert(1, other_def1);

    base.merge(other);
    assert_eq!(base.version, 1);
    assert_eq!(base.maxwidth, Some(800));
    assert_eq!(base.animation_sort, Some(SortKind::Id));
    assert_eq!(base.collision_sort, Some(SortKind::Ascend));
    assert!(base.surface(0).unwrap().name.is_some());
    assert!(base.surface(1).is_some());

    // Surface ID enumeration queries
    assert_eq!(base.defined_surface_ids(), vec![0, 1]);
    assert_eq!(base.all_surface_ids(), vec![0, 1]);

    base.aliases.insert("extra".into(), vec![2, 5]);
    base.kero_aliases.insert("kextra".into(), vec![5, 10]);
    assert_eq!(base.defined_surface_ids(), vec![0, 1]);
    assert_eq!(base.all_surface_ids(), vec![0, 1, 2, 5, 10]);
}
