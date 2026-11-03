use super::SurfacesTxt;
use crate::surfaces::types::SurfaceDefinition;

#[test]
fn test_surfaces_txt_methods() {
    let mut txt = SurfacesTxt::default();
    let mut def = SurfaceDefinition::default();
    def.name = Some("Surface0".into());
    txt.surfaces.insert(0, def);

    txt.aliases.insert("main".into(), vec![0]);
    txt.kero_aliases.insert("kero_main".into(), vec![0]);

    assert!(txt.surface(0).is_some());
    assert!(txt.alias_numbers("MAIN").is_some());
    assert!(txt.alias_numbers("UNKNOWN").is_none());

    assert!(txt.kero_alias_numbers("KERO_MAIN").is_some());
    assert!(txt.kero_alias_numbers("UNKNOWN").is_none());

    assert!(txt.resolve_alias("MAIN").is_some());
    assert!(txt.resolve_alias("UNKNOWN").is_none());

    assert!(txt.resolve_kero_alias("KERO_MAIN").is_some());
    assert!(txt.resolve_kero_alias("UNKNOWN").is_none());

    // find_by_name & resolve_name_or_alias
    assert_eq!(txt.find_by_name("Surface0").map(|(id, _)| id), Some(0));
    assert_eq!(txt.find_by_name("surface0").map(|(id, _)| id), Some(0));
    assert!(txt.find_by_name("unknown").is_none());

    assert_eq!(
        txt.resolve_name_or_alias("Surface0").map(|(id, _)| id),
        Some(0)
    );
    assert_eq!(txt.resolve_name_or_alias("main").map(|(id, _)| id), Some(0));
    assert!(txt.resolve_name_or_alias("unknown").is_none());

    assert_eq!(
        txt.resolve_kero_name_or_alias("kero_main")
            .map(|(id, _)| id),
        Some(0)
    );
    assert_eq!(
        txt.resolve_kero_name_or_alias("Surface0").map(|(id, _)| id),
        Some(0)
    );
}

#[test]
fn test_plan_composition_bind_and_unmapped() {
    use crate::surfaces::types::{AnimationPattern, DrawMethod, Interval, SerikoAnimation};

    let mut txt = SurfacesTxt::default();
    let mut def = SurfaceDefinition::default();

    let mut bind_anim = SerikoAnimation::default();
    bind_anim.id = 100;
    bind_anim.interval = Some(Interval::Bind);
    bind_anim.patterns.push(AnimationPattern {
        index: 0,
        method: DrawMethod::Overlay,
        surface: 20,
        wait: 85,
        wait_max: None,
        x: 0,
        y: 0,
        options: vec![],
    });

    let mut always_anim = SerikoAnimation::default();
    always_anim.id = 101;
    always_anim.interval = Some(Interval::Always);

    def.animations.insert(100, bind_anim);
    def.animations.insert(101, always_anim);

    txt.surfaces.insert(0, def);

    let plan = txt.plan_composition(0, &[100, 101, 999]).unwrap();
    assert_eq!(plan.bind_pattern_count(), 1);
    assert_eq!(plan.layer_files(), vec!["20"]);
    assert!(txt.plan_composition(999, &[]).is_none());
}

#[test]
fn test_surfaces_txt_cursor_tooltip_and_merge() {
    use crate::surfaces::types::CursorDefinition;
    use std::collections::BTreeMap;

    let mut txt = SurfacesTxt::default();
    txt.cursors.insert(
        "sakura".into(),
        vec![CursorDefinition {
            event: "Enter".into(),
            collision: "Head".into(),
            cursor: "pointer".into(),
        }],
    );
    txt.tooltips.insert("kero".into(), {
        let mut m = BTreeMap::new();
        m.insert("Body".into(), "Tooltip Text".into());
        m
    });

    assert_eq!(txt.get_cursor("sakura", "Enter", "Head"), Some("pointer"));
    assert_eq!(txt.get_cursor("0", "Enter", "Head"), Some("pointer"));
    assert_eq!(txt.get_cursor("unknown", "Enter", "Head"), None);
    assert_eq!(txt.get_tooltip("kero", "Body"), Some("Tooltip Text"));
    assert_eq!(txt.get_tooltip("1", "Body"), Some("Tooltip Text"));
    assert_eq!(txt.get_tooltip("unknown", "Body"), None);

    let mut txt2 = SurfacesTxt::default();
    txt2.surfaces.insert(1, SurfaceDefinition::default());
    txt.merge(txt2);
    assert!(txt.surface(1).is_some());
}
