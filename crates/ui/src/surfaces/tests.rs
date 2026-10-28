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
fn test_parse_interval_all_variants() {
    assert_eq!(Interval::parse("always"), Interval::Always);
    assert_eq!(Interval::parse("sometimes"), Interval::Sometimes);
    assert_eq!(Interval::parse("rarely"), Interval::Rarely);
    assert_eq!(Interval::parse("never"), Interval::Never);
    assert_eq!(Interval::parse("runonce"), Interval::RunOnce);
    assert_eq!(Interval::parse("bind"), Interval::Bind);
    assert_eq!(Interval::parse("talk"), Interval::Talk);
    assert_eq!(Interval::parse("starttalk"), Interval::StartTalk);
    assert_eq!(Interval::parse("endtalk"), Interval::EndTalk);
    assert_eq!(Interval::parse(r"\e"), Interval::YenE);
    assert_eq!(Interval::parse("/e"), Interval::YenE);
    assert_eq!(Interval::parse("random,3"), Interval::Random(3));
    assert_eq!(Interval::parse("periodic,1000"), Interval::Periodic(1000));
    assert_eq!(
        Interval::parse("unknown_mode"),
        Interval::Custom("unknown_mode".to_string())
    );
    assert_eq!(
        Interval::parse("custom_item,123"),
        Interval::Custom("custom_item".to_string())
    );
}

#[test]
fn test_parse_draw_method_variants() {
    assert_eq!(DrawMethod::parse("base"), DrawMethod::Base);
    assert_eq!(DrawMethod::parse("overlay"), DrawMethod::Overlay);
    assert_eq!(DrawMethod::parse("overlayfast"), DrawMethod::OverlayFast);
    assert_eq!(DrawMethod::parse("fast"), DrawMethod::OverlayFast);
    assert_eq!(DrawMethod::parse("overlay-fast"), DrawMethod::OverlayFast);
    assert_eq!(DrawMethod::parse("interpolate"), DrawMethod::Interpolate);
    assert_eq!(DrawMethod::parse("replace"), DrawMethod::Replace);
    assert_eq!(DrawMethod::parse("add"), DrawMethod::Add);
    assert_eq!(DrawMethod::parse("bind"), DrawMethod::Bind);
    assert_eq!(
        DrawMethod::parse("blend-multiply"),
        DrawMethod::Blend("multiply".to_string())
    );
    assert_eq!(
        DrawMethod::parse("blend-add"),
        DrawMethod::Blend("add".to_string())
    );
    assert_eq!(
        DrawMethod::parse("custom_method"),
        DrawMethod::Custom("custom_method".to_string())
    );
}

#[test]
fn test_parse_draw_method_formatting() {
    // Case insensitivity
    assert_eq!(DrawMethod::parse("BASE"), DrawMethod::Base);
    assert_eq!(DrawMethod::parse("OverLay"), DrawMethod::Overlay);
    assert_eq!(DrawMethod::parse("OverlayFast"), DrawMethod::OverlayFast);
    assert_eq!(DrawMethod::parse("FAST"), DrawMethod::OverlayFast);
    assert_eq!(DrawMethod::parse("OVERLAY-FAST"), DrawMethod::OverlayFast);
    assert_eq!(DrawMethod::parse("INTERPOLATE"), DrawMethod::Interpolate);
    assert_eq!(DrawMethod::parse("REPLACE"), DrawMethod::Replace);
    assert_eq!(DrawMethod::parse("ADD"), DrawMethod::Add);
    assert_eq!(DrawMethod::parse("BIND"), DrawMethod::Bind);
    assert_eq!(
        DrawMethod::parse("BLEND-MULTIPLY"),
        DrawMethod::Blend("multiply".to_string())
    );

    // Whitespace trimming
    assert_eq!(DrawMethod::parse("  base  "), DrawMethod::Base);
    assert_eq!(
        DrawMethod::parse(" blend-screen "),
        DrawMethod::Blend("screen".to_string())
    );
    assert_eq!(
        DrawMethod::parse("  move_to  "),
        DrawMethod::Custom("move_to".to_string())
    );
}

#[test]
fn test_parse_interval_formatting_and_defaults() {
    // Case insensitivity
    assert_eq!(Interval::parse("ALWAYS"), Interval::Always);
    assert_eq!(Interval::parse("SomeTimes"), Interval::Sometimes);
    assert_eq!(Interval::parse("RaReLy"), Interval::Rarely);
    assert_eq!(Interval::parse("NeVeR"), Interval::Never);
    assert_eq!(Interval::parse("RunOnce"), Interval::RunOnce);
    assert_eq!(Interval::parse("BIND"), Interval::Bind);
    assert_eq!(Interval::parse("TALK"), Interval::Talk);
    assert_eq!(Interval::parse("STARTTALK"), Interval::StartTalk);
    assert_eq!(Interval::parse("ENDTALK"), Interval::EndTalk);
    assert_eq!(Interval::parse(r"\E"), Interval::YenE);
    assert_eq!(Interval::parse("/E"), Interval::YenE);
    assert_eq!(Interval::parse("RANDOM,15"), Interval::Random(15));
    assert_eq!(Interval::parse("PERIODIC,500"), Interval::Periodic(500));

    // Whitespace trimming
    assert_eq!(Interval::parse("  always  "), Interval::Always);
    assert_eq!(Interval::parse(" random , 7 "), Interval::Random(7));
    assert_eq!(Interval::parse(" periodic , 2500 "), Interval::Periodic(2500));

    // Numeric parameter defaults when omitted or invalid
    assert_eq!(Interval::parse("random"), Interval::Random(10));
    assert_eq!(Interval::parse("random,invalid"), Interval::Random(10));
    assert_eq!(Interval::parse("random,-5"), Interval::Random(10));
    assert_eq!(Interval::parse("periodic"), Interval::Periodic(1000));
    assert_eq!(Interval::parse("periodic,abc"), Interval::Periodic(1000));
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

    let sample = r"surface0
{
animation0.interval,always
animation0.pattern0,base,6,85-120,0,0
}
";
    let txt2 = SurfacesTxt::parse(sample);
    let p0 = &txt2.surface(0).unwrap().animations[&0].patterns[0];
    assert_eq!(p0.wait, 85);
    assert_eq!(p0.wait_max, Some(120));
    let sample_single = r"surface0
{
animation0.pattern0,base,6,85
}
";
    let txt3 = SurfacesTxt::parse(sample_single);
    let p0 = &txt3.surface(0).unwrap().animations[&0].patterns[0];
    assert_eq!(p0.wait, 85);
    assert_eq!(p0.wait_max, None);
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
    assert_eq!(
        txt.kero_alias_numbers("nameycand").unwrap(),
        &[11u32, 12][..]
    );
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
            wait_max: None,
            x: 0,
            y: 0,
            options: vec![],
        })
    );
}
