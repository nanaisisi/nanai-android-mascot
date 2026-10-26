//! `surfaces.txt` パーサー（ukadoc-spec / descript / shell-surfaces 準拠）
//!
//! シェルのサーフィス定義（Element 描画 / SERIKO アニメーション / Collision 当たり判定 /
//! Alias・範囲指定・surface.append マージ）を Rust 構造体群へとパースする。
//! パーサーはテキスト評価のみを担当し、描画・アニメーション再生は UI 実装側が行う。

pub mod parser;
pub mod types;

pub use parser::{expand_range, parse_surfaces_txt};
pub use types::{
    AnimationPattern, BalloonOffset, CollisionArea, CollisionShape, CompositionLayer,
    CompositionPlan, DrawMethod, ElementDef, Interval, Points, SerikoAnimation, SortKind,
    SurfaceDefinition, SurfacesTxt,
};

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_expand_range() {
        assert_eq!(
            expand_range("0-9,20-22"),
            (0..10).chain(20..23).collect::<Vec<u32>>()
        );
        assert_eq!(expand_range("19,100,101"), [19, 100, 101]);
        assert_eq!(expand_range("[7]"), [7]);
        assert!(expand_range("abc").is_empty());
    }

    #[test]
    fn test_parse_interval_variants() {
        assert_eq!(Interval::parse("random,3"), Interval::Random(3));
        assert_eq!(Interval::parse("periodic,1000"), Interval::Periodic(1000));
        assert_eq!(Interval::parse("sometimes"), Interval::Sometimes);
        assert_eq!(Interval::parse("rarely"), Interval::Rarely);
        assert_eq!(Interval::parse("always"), Interval::Always);
        assert_eq!(Interval::parse("never"), Interval::Never);
        assert_eq!(Interval::parse("runonce"), Interval::RunOnce);
        assert_eq!(Interval::parse("bind"), Interval::Bind);
        assert_eq!(Interval::parse("talk"), Interval::Talk);
        assert_eq!(Interval::parse("starttalk"), Interval::StartTalk);
        assert_eq!(Interval::parse("endtalk"), Interval::EndTalk);
        assert_eq!(Interval::parse(r"\e"), Interval::YenE);
    }

    #[test]
    fn test_parse_mock_surfaces() {
        let sample = r"// シェルの表示設定
charset,Shift_JIS

descript
{
version,1
animation.sort,id
}

surface0-9,20-22
{
element0,base,surface0.png,0,0
collisionex0,head,rect,34,20,157,72
collisionex1,bust,rect,63,159,122,198
collisionex2,skirt,rect,24,301,163,383
collisionex3,hand,rect,132,252,157,304
animation100.interval,bind
animation100.pattern0,add,100,0,0,0
}

surface.append0
{
animation0.interval,random,3
animation0.pattern0,base,6,0,0,0
animation0.pattern1,base,-1,85,0,0
element1,overlay,surface01.png,0,0
point.centerx,96
sakura.balloon.offsetx,-10
";
        let txt = SurfacesTxt::parse(sample);

        assert_eq!(txt.charset.as_deref(), Some("Shift_JIS"));
        assert_eq!(txt.version, 1);
        assert_eq!(txt.animation_sort, Some(SortKind::Id));

        let def0 = txt.surface(0).unwrap();
        assert_eq!(
            def0.element(0).map(|e| e.file.as_str()),
            Some("surface0.png")
        );
        let head = def0.collisions.iter().find(|c| c.name == "head").unwrap();
        assert_eq!(
            head.shape,
            CollisionShape::Rect {
                x1: 34,
                y1: 20,
                x2: 157,
                y2: 72
            }
        );

        assert_eq!(
            def0.element(1).map(|e| e.method.clone()),
            Some(DrawMethod::Overlay)
        );
        let anim0 = &def0.animations[&0];
        assert_eq!(anim0.interval, Some(Interval::Random(3)));
        assert_eq!(anim0.patterns[0].surface, 6);
        assert_eq!(anim0.patterns[1].surface, -1);
        assert_eq!(anim0.patterns[1].wait, 85);

        let anim100 = &def0.animations[&100];
        assert_eq!(anim100.interval, Some(Interval::Bind));

        assert_eq!(def0.points.center_x, Some(96));
        assert_eq!(def0.balloon_offsets["sakura"].x, Some(-10));

        assert!(txt.surface(22).is_some());
        assert_eq!(
            txt.surface(22).unwrap().element(0).unwrap().method,
            DrawMethod::Base
        );

        assert_eq!(def0.hit_test(90, 40).map(|c| c.name.as_str()), Some("head"));
        assert_eq!(
            def0.hit_test(90, 170).map(|c| c.name.as_str()),
            Some("bust")
        );
        assert_eq!(def0.hit_test(5, 5), None);
    }

    #[test]
    fn test_parse_polygon_and_alias() {
        let sample = r"surface1
{
collisionex0,arm,polygon,10,10,30,10,30,30,10,30
name,腕あげ
}

surface.alias
{
笑顔,1,2
にこにこ,3
}
";
        let txt = SurfacesTxt::parse(sample);

        let def1 = txt.surface(1).unwrap();
        match def1.collisions[0].shape.clone() {
            CollisionShape::Polygon { vertices } => {
                assert_eq!(vertices.len(), 4);
                assert_eq!(vertices[0], (10, 10));
            }
            other => panic!("unexpected: {other:?}"),
        }
        assert!(def1.hit_test(15, 15).is_some());
        assert!(def1.hit_test(200, 200).is_none());
        assert_eq!(def1.name.as_deref(), Some("腕あげ"));

        assert_eq!(txt.alias_numbers("笑顔").unwrap(), &[1u32, 2][..]);
        assert_eq!(txt.alias_numbers("にこにこ").unwrap(), &[3u32][..]);
        assert!(txt.resolve_alias("笑顔").is_some());
    }

    #[test]
    fn test_parse_character_alias_blocks() {
        let sample = r"surface0
{
element0,base,surface0.png,0,0
}

surface10
{
element0,base,surface10.png,0,0
}

sakura.surface.alias
{
素,[0]
照れ,[1,101,201]
}

kero.surface.alias
{
通常,[10]
}

char1.surface.alias
{
nameycand,[11,12]
}

surface.alias
{
共通,9
}
";
        let txt = SurfacesTxt::parse(sample);

        assert_eq!(txt.alias_numbers("素").unwrap(), &[0u32][..]);
        assert_eq!(txt.alias_numbers("照れ").unwrap(), &[1u32, 101, 201][..]);
        assert_eq!(txt.alias_numbers("共通").unwrap(), &[9u32][..]);
        assert!(txt.alias_numbers("通常").is_none());

        assert_eq!(txt.kero_alias_numbers("通常").unwrap(), &[10u32][..]);
        assert_eq!(txt.kero_alias_numbers("nameycand").unwrap(), &[11u32, 12][..]);
        assert!(txt.kero_alias_numbers("照れ").is_none());
        assert!(txt.resolve_kero_alias("通常").is_some());
    }

    #[test]
    fn test_pattern_bare_and_blend() {
        let sample = r"surface5
{
animation1.interval,periodic,500
animation1.pattern,blend-multiply,11,40,5,6
animation1.pattern,overlayfast,-1,40,0,0
animation2.name,まばたき
}
";
        let txt = SurfacesTxt::parse(sample);
        let def = txt.surface(5).unwrap();
        let anim1 = &def.animations[&1];
        assert_eq!(anim1.interval, Some(Interval::Periodic(500)));
        assert_eq!(anim1.patterns[0].index, 0);
        assert_eq!(
            anim1.patterns[0].method,
            DrawMethod::Blend("multiply".into())
        );
        assert_eq!(anim1.patterns[0].x, 5);
        assert_eq!(anim1.patterns[1].method, DrawMethod::OverlayFast);
        assert_eq!(anim1.patterns[1].index, 1);
        assert_eq!(def.animations[&2].name.as_deref(), Some("まばたき"));
    }

    #[test]
    fn test_parse_mock_nanai_file() {
        let path = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../../assets/ghost/mock_nanai/shell/master/surfaces.txt");
        if !path.exists() {
            return;
        }
        let content = crate::vfs::open_text_file(&path).unwrap();
        let txt = SurfacesTxt::parse(&content);

        assert_eq!(txt.version, 1);
        let def0 = txt.surface(0).unwrap();
        let names: Vec<&str> = def0.collisions.iter().map(|c| c.name.as_str()).collect();
        assert!(names.contains(&"head") && names.contains(&"bust") && names.contains(&"skirt"));
        assert!(def0.animations.contains_key(&0));
        assert!(txt.surface(100).is_some());
    }

    #[test]
    fn test_plan_composition() {
        let sample = r"charset,Shift_JIS
surface0
{
element0,base,surface0.png,0,0
collisionex0,head,rect,0,0,10,10
animation100.interval,bind
animation100.pattern0,add,100,0,0,0
animation100.pattern1,add,101,0,0,0
animation200.interval,sometimes
animation200.pattern0,overlay,9,500,0,0
}

surface.append0
{
element1,overlay,surface01.png,0,0
}
";
        let txt = SurfacesTxt::parse(sample);

        let plan = txt.plan_composition(0, &[]).unwrap();
        assert_eq!(plan.layers.len(), 2);
        assert_eq!(
            plan.layer_files(),
            vec!["surface0.png".to_string(), "surface01.png".to_string()]
        );

        let plan = txt.plan_composition(0, &[100]).unwrap();
        assert_eq!(plan.bind_pattern_count(), 2);
        assert_eq!(
            plan.layers[2],
            CompositionLayer::Pattern(AnimationPattern {
                index: 0,
                method: DrawMethod::Add,
                surface: 100,
                wait: 0,
                x: 0,
                y: 0,
                options: vec![],
            })
        );

        let plan = txt.plan_composition(0, &[200, 999]).unwrap();
        assert_eq!(plan.bind_pattern_count(), 0);

        assert!(txt.plan_composition(42, &[]).is_none());
    }

    #[test]
    fn test_plan_composition_mock_nanai() {
        let path = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../../assets/ghost/mock_nanai/shell/master/surfaces.txt");
        if !path.exists() {
            return;
        }
        let content = crate::vfs::open_text_file(&path).unwrap();
        let txt = SurfacesTxt::parse(&content);

        let plan = txt.plan_composition(0, &[100]).unwrap();
        assert_eq!(plan.bind_pattern_count(), 1);
        assert!(
            matches!(plan.layers.last(), Some(CompositionLayer::Pattern(p)) if p.surface == 100)
        );
    }
}
