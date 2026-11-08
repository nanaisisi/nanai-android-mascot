/**
 * @file points_ui.rs
 * @brief point エイリアス、balloon.offset スコープ、cursor / tooltips ブロックパース単体テスト
 */
use super::*;

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
