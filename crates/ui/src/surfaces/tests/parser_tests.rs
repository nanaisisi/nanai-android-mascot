use crate::surfaces::*;

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

    // char2.cursor and char2.tooltips blocks
    let char_cursor_tooltips = r"
char2.cursor
{
mouseup0,Hand,0,0,50,50
}

char2.tooltips
{
Head,Head tooltip
}
";
    let parsed_char = SurfacesTxt::parse(char_cursor_tooltips);
    assert_eq!(parsed_char.cursors["char2"].len(), 1);
    assert_eq!(parsed_char.tooltips["char2"]["Head"], "Head tooltip");

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

    let sample2 = r"surface0
{
animation0.interval,always
animation0.pattern0,base,6,85-120,0,0
}
";
    let txt2 = SurfacesTxt::parse(sample2);
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
fn test_parse_point_aliases_and_syntax_variations() {
    let sample = r"charset,UTF-8
surface0
{
point.center.x,110
point.center.y,220
point.baseposx,330
point.baseposy,440
point.kinoko.center.x,550
point.kinoko.center.y,660
}
";
    let txt = SurfacesTxt::parse(sample);
    let s0 = txt.surface(0).unwrap();
    assert_eq!(s0.points.center_x, Some(110));
    assert_eq!(s0.points.center_y, Some(220));
    assert_eq!(s0.points.basepos_x, Some(330));
    assert_eq!(s0.points.basepos_y, Some(440));
    assert_eq!(s0.points.kinoko_center_x, Some(550));
    assert_eq!(s0.points.kinoko_center_y, Some(660));
}

#[test]
fn test_parse_balloon_offset_scope_prefixes() {
    let sample = r"charset,UTF-8
surface0
{
sakura.balloon.offsetx,-15
sakura.balloon.offsety,-30
kero.balloon.offsetx,45
kero.balloon.offsety,60
balloon.offsetx,5
balloon.offsety,10
}
";
    let txt = SurfacesTxt::parse(sample);
    let s0 = txt.surface(0).unwrap();
    assert_eq!(s0.balloon_offsets.get("sakura").unwrap().x, Some(-15));
    assert_eq!(s0.balloon_offsets.get("sakura").unwrap().y, Some(-30));
    assert_eq!(s0.balloon_offsets.get("kero").unwrap().x, Some(45));
    assert_eq!(s0.balloon_offsets.get("kero").unwrap().y, Some(60));
    assert_eq!(s0.balloon_offsets.get("*").unwrap().x, Some(5));
    assert_eq!(s0.balloon_offsets.get("*").unwrap().y, Some(10));
}

#[test]
fn test_parse_cursor_and_tooltips_blocks() {
    let sample = r"charset,UTF-8
sakura.cursor
{
mouseup0,Head,system:hand
mousedown0,Head,system:finger
mouseup1,Bust,system:hand
mousedown1,Bust,system:grip
mousehover0,Face,system:cross
}

kero.cursor
{
mousedown0,Tail,system:finger
}

sakura.tooltips
{
Bust,怒ります。
Head,つつかれると痛いです。
}

kero.tooltips
{
Tail,しっぽです
}
";
    let txt = SurfacesTxt::parse(sample);

    // Cursors
    assert_eq!(txt.get_cursor("0", "mouseup", "Head"), Some("system:hand"));
    assert_eq!(
        txt.get_cursor("sakura", "mousedown", "Head"),
        Some("system:finger")
    );
    assert_eq!(
        txt.get_cursor("sakura", "mousedown", "Bust"),
        Some("system:grip")
    );
    assert_eq!(
        txt.get_cursor("sakura", "mousehover", "Face"),
        Some("system:cross")
    );
    assert_eq!(
        txt.get_cursor("1", "mousedown", "Tail"),
        Some("system:finger")
    );
    assert_eq!(txt.get_cursor("sakura", "mousedown", "Tail"), None);

    // Tooltips
    assert_eq!(txt.get_tooltip("0", "Bust"), Some("怒ります。"));
    assert_eq!(
        txt.get_tooltip("sakura", "Head"),
        Some("つつかれると痛いです。")
    );
    assert_eq!(txt.get_tooltip("kero", "Tail"), Some("しっぽです"));
    assert_eq!(txt.get_tooltip("kero", "Head"), None);

    // Merge testing
    let sample2 = r"sakura.cursor
{
mousedown2,Bust,custom_grip.cur
}
sakura.tooltips
{
Bust,触らないで！
}
";
    let mut txt1 = txt;
    let txt2 = SurfacesTxt::parse(sample2);
    txt1.merge(txt2);

    assert_eq!(
        txt1.get_cursor("sakura", "mousedown", "Bust"),
        Some("custom_grip.cur")
    );
    assert_eq!(txt1.get_tooltip("sakura", "Bust"), Some("触らないで！"));
}
