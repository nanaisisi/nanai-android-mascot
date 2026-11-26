use super::*;

#[test]
fn test_parse_surfaces_txt_basic() {
    let input = r#"
surface0,1
element0,base,surface0.png,0,0
element1,overlay,eye.png,10,20
collision0,10,10,50,50,head
"#;
    let manifest = parse_surfaces_txt(input);
    assert_eq!(manifest.elements().len(), 2);
    assert!(manifest.elements().contains_key("0"));
    assert!(manifest.elements().contains_key("1"));
    assert_eq!(manifest.elements()["0"].len(), 2);
    assert_eq!(manifest.collisions()["0"][0].name(), "head");
}

#[test]
fn test_parse_surface_header_range() {
    let targets = parse_surface_header("surface0,1,3-5").unwrap();
    assert_eq!(targets, vec!["0", "1", "3", "4", "5"]);
}

#[test]
fn test_parse_collisionex() {
    let input = r#"
surface0
collisionex0,head,rect,10,10,50,50
collisionex1,bust,circle,100,100,25
collisionex2,leg,polygon,0,0,10,0,10,20
"#;
    let manifest = parse_surfaces_txt(input);
    assert_eq!(manifest.collisions()["0"].len(), 3);
    assert_eq!(manifest.collisions()["0"][0].name(), "head");
    assert_eq!(manifest.collisions()["0"][1].name(), "bust");
    assert_eq!(manifest.collisions()["0"][2].name(), "leg");
}

#[test]
fn test_parse_collisionoption_brace() {
    let txt = r#"
sakura.collisionoption
{
nodrag0,Knob
nocontextmenu0,Head
}
kero.collisionoption {
nodrag0,Tail
}
"#;
    let parsed = parse_surfaces_txt(txt);
    assert_eq!(
        parsed.nodrag_collisions().get("sakura"),
        Some(&vec!["Knob".to_string()])
    );
    assert_eq!(
        parsed.nocontextmenu_collisions().get("sakura"),
        Some(&vec!["Head".to_string()])
    );
    assert_eq!(
        parsed.nodrag_collisions().get("kero"),
        Some(&vec!["Tail".to_string()])
    );
}
