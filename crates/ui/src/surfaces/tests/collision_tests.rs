use crate::surfaces::*;

#[test]
fn test_collision_sort_and_hit_test() {
    let sample = r"charset,UTF-8
descript
{
version,1
collision.sort,ascend
}

surface0
{
// 先にID=10のBodyを定義
collision10,0,0,100,100,Body
// 後にID=1のHeadを定義（同一領域と重なる）
collision1,0,0,50,50,Head
}
";
    let txt = SurfacesTxt::parse(sample);
    assert_eq!(txt.collision_sort, Some(SortKind::Ascend));

    // (25, 25) は Body(10) と Head(1) の両方にヒットする
    // ascend の場合は ID が小さい Head(1) が優先される
    let hit_asc = txt.hit_test(0, 25, 25).unwrap();
    assert_eq!(hit_asc.name, "Head");
    assert_eq!(hit_asc.id, Some(1));
    assert_eq!(hit_asc.x, 25);
    assert_eq!(hit_asc.y, 25);

    // descend の場合は ID が大きい Body(10) が優先される
    let def0 = txt.surface(0).unwrap();
    let hit_desc = def0
        .hit_test_sorted(25, 25, Some(&SortKind::Descend))
        .unwrap();
    assert_eq!(hit_desc.name, "Body");
    assert_eq!(hit_desc.id, Some(10));

    // none または定義順の場合は、先に定義された Body(10) が優先される
    let hit_none = def0.hit_test_sorted(25, 25, Some(&SortKind::None)).unwrap();
    assert_eq!(hit_none.name, "Body");
}

#[test]
fn test_animation_collision_and_binds() {
    let sample = r"charset,UTF-8
surface0
{
collision0,0,0,100,100,BaseBody
animation100.interval,bind
animation100.pattern0,add,100,0,0,0
// アニメーション専用当たり判定
animation100.collisionex0,ArmorBust,rect,10,10,60,60
}
";
    let txt = SurfacesTxt::parse(sample);
    let def0 = txt.surface(0).unwrap();
    let anim100 = def0.animations.get(&100).unwrap();
    assert_eq!(anim100.collisions.len(), 1);
    assert_eq!(anim100.collisions[0].name, "ArmorBust");

    // binds なしのヒットテスト -> BaseBody
    let hit_no_bind = txt.hit_test_with_binds(0, 20, 20, &[]).unwrap();
    assert_eq!(hit_no_bind.name, "BaseBody");

    // bind [100] を指定した場合 -> アニメーション当たり判定の ArmorBust が優先
    let hit_with_bind = txt.hit_test_with_binds(0, 20, 20, &[100]).unwrap();
    assert_eq!(hit_with_bind.name, "ArmorBust");

    // 当たり判定外をクリックした場合 -> None
    assert!(txt.hit_test_with_binds(0, 200, 200, &[100]).is_none());

    // 存在しない surface_id
    assert!(txt.hit_test_with_binds(999, 20, 20, &[100]).is_none());

    // CollisionShape::bounding_box tests for circle, ellipse, and empty/negative edge cases
    use crate::surfaces::types::CollisionShape;
    let circle = CollisionShape::Circle {
        cx: 50,
        cy: 50,
        r: 10.5,
    };
    assert_eq!(circle.bounding_box(), Some((39, 39, 61, 61)));
    let circle_zero = CollisionShape::Circle {
        cx: 50,
        cy: 50,
        r: 0.0,
    };
    assert_eq!(circle_zero.bounding_box(), None);

    let ellipse = CollisionShape::Ellipse {
        cx: 50,
        cy: 50,
        rx: 10.5,
        ry: 20.2,
    };
    assert_eq!(ellipse.bounding_box(), Some((39, 29, 61, 71)));
    let ellipse_zero = CollisionShape::Ellipse {
        cx: 50,
        cy: 50,
        rx: -1.0,
        ry: 20.2,
    };
    assert_eq!(ellipse_zero.bounding_box(), None);

    let empty_poly = CollisionShape::Polygon { vertices: vec![] };
    assert_eq!(empty_poly.bounding_box(), None);
}

#[test]
fn test_surfaces_merge_overlay() {
    let base_sample = r"charset,Shift_JIS
descript
{
version,1
collision.sort,none
}

surface0
{
element0,base,surface0.png,0,0
collision0,0,0,50,50,Head
animation10.interval,sometimes
animation10.pattern0,overlay,1,500,0,0
}
";

    let s2_sample = r"charset,UTF-8
descript
{
version,2
maxwidth,600
animation.sort,ascend
collision.sort,descend
root.prop,custom_value
}

surface0
{
name,OverwrittenName
point.centerx,150
point.centery,200
point.baseposx,100
point.baseposy,250
point.kinoko.centerx,80
point.kinoko.centery,120
sakura.balloon.offsetx,30
custom.surface.prop,val
element1,overlay,acc.png,0,0
collision1,0,0,50,50,Hat
animation10.interval,always
animation10.pattern1,overlay,2,500,0,0
animation20.interval,runonce
animation20.pattern0,overlay,3,100,0,0
}

surface1
{
element0,base,surface1.png,0,0
}

surface.alias
{
alias_face,0,1
}

kero.surface.alias
{
kero_face,10
}
";

    let mut base = SurfacesTxt::parse(base_sample);
    let s2 = SurfacesTxt::parse(s2_sample);

    base.merge(s2);

    assert_eq!(base.charset.as_deref(), Some("UTF-8"));
    assert_eq!(base.collision_sort, Some(SortKind::Descend));

    let def0 = base.surface(0).unwrap();
    assert_eq!(def0.elements.len(), 2);
    assert_eq!(def0.collisions.len(), 2);
    assert_eq!(def0.animations.get(&10).unwrap().patterns.len(), 2);

    assert!(base.surface(1).is_some());
}

#[test]
fn test_surfacetable_options() {
    let sample = r"charset,UTF-8
version,1
option,DisableNoDefineSurfaces,CustomOpt
group,TestGroup
{
0,Normal
}
";
    let table = crate::surfacetable::SurfaceTable::parse(sample);
    assert!(table.has_option("disablenodefinesurfaces"));
    assert!(table.has_option("customopt"));
    assert!(!table.has_option("nonexistent"));
    assert!(table.disable_no_define_surfaces());
}

#[test]
fn test_hyphen_sort_and_icon_rect() {
    let sample = r"charset,UTF-8
descript
{
version,1
collision-sort,descend
animation-sort,ascend
}

surface0
{
collision0,0,0,100,100,body
collision1,10,10,50,50,face
icon.rect,10,20,60,40
}

surface1
{
collision0,0,0,100,100,body
collision1,20,10,60,70,head
}
";
    let txt = SurfacesTxt::parse(sample);
    assert_eq!(txt.collision_sort, Some(SortKind::Descend));
    assert_eq!(txt.animation_sort, Some(SortKind::Ascend));

    let s0 = txt.surface(0).unwrap();
    assert_eq!(s0.icon_rect, Some([10, 20, 60, 40]));

    // icon.rect: width = 50, height = 20 -> max side is 50.
    // center_x = (10 + 60) / 2 = 35, center_y = (20 + 40) / 2 = 30
    // half = 25 -> x1 = 35 - 25 = 10, y1 = 30 - 25 = 5, x2 = 60, y2 = 55.
    let square0 = s0.effective_icon_rect().unwrap();
    assert_eq!(square0, [10, 5, 60, 55]);

    // s1 has no icon.rect, but has a "head" collision [20, 10, 60, 70]
    // width = 40, height = 60 -> max side is 60.
    // center_x = 40, center_y = 40 -> half = 30 -> [10, 10, 70, 70]
    let s1 = txt.surface(1).unwrap();
    assert_eq!(s1.icon_rect, None);
    let square1 = s1.effective_icon_rect().unwrap();
    assert_eq!(square1, [10, 10, 70, 70]);
}
