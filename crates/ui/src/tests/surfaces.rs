/**
 * @file surfaces.rs
 * @brief surfaces.txt ワイルドカード・CollisionEx 定義単体テスト
 */
use super::*;

#[test]
fn test_collisionex_circle_and_ellipse() {
    let sample = r"surface2
{
collisionex0,face,circle,100,100,50
collisionex1,halo,ellipse,100,100,60,30
}
";
    let txt = SurfacesTxt::parse(sample);
    let def2 = txt.surface(2).unwrap();

    let face = def2.hit_test(140, 100).expect("円の内側は face");
    assert_eq!(face.name, "face");
    assert!(def2.hit_test(190, 100).is_none());

    let halo = def2.hit_test(160, 100).expect("楕円の内側は halo");
    assert_eq!(halo.name, "halo");
    assert!(def2.hit_test(150, 40).is_none());
}

#[test]
fn test_surfaces_txt_cursor_and_tooltip_wildcards() {
    let sample = r"cursor
{
mouseup,Head,system:hand
mousedown,Bust,system:finger
}
tooltips
{
Head,Pat here!
Bust,Poke here!
}
";
    let txt = SurfacesTxt::parse(sample);
    assert_eq!(
        txt.get_cursor("sakura", "mouseup", "Head"),
        Some("system:hand")
    );
    assert_eq!(txt.get_cursor("0", "mouseup", "Head"), Some("system:hand"));
    assert_eq!(
        txt.get_cursor("kero", "mousedown", "Bust"),
        Some("system:finger")
    );
    assert_eq!(
        txt.get_cursor("1", "mousedown", "Bust"),
        Some("system:finger")
    );
    assert_eq!(txt.get_cursor("0", "nonexistent", "Head"), None);

    assert_eq!(txt.get_tooltip("sakura", "Head"), Some("Pat here!"));
    assert_eq!(txt.get_tooltip("0", "Head"), Some("Pat here!"));
    assert_eq!(txt.get_tooltip("kero", "Bust"), Some("Poke here!"));
    assert_eq!(txt.get_tooltip("1", "Bust"), Some("Poke here!"));
    assert_eq!(txt.get_tooltip("0", "NonExistent"), None);
}
