//! `surfaces.txt` パーサー単体テスト

use super::*;

#[test]
fn test_parse_surfaces_txt_blocks() {
    let text = "charset,UTF-8\r\nroot_prop,root_val\r\n,empty_key\r\nno_comma_root\r\n\
        descript {\r\nversion,1\r\nmaxwidth,300\r\nanimation.sort,ascend\r\ncollision.sort,descend\r\ncustom_desc,val\r\nno_comma_desc\r\n}\r\n\
        descript_invalid {\r\n}\r\n\
        surface.alias {\r\nmain,0,1\r\n,empty_alias\r\nno_comma_alias\r\n}\r\n\
        kero.surface.alias {\r\nkmain,10\r\n}\r\n\
        char0.surface.alias {\r\nc0main,0\r\n}\r\n\
        char1.surface.alias {\r\nc1main,10\r\n}\r\n\
        surface.alias.invalid {\r\n}\r\n\
        surface.append.invalid {\r\n}\r\n\
        surface.unknown {\r\n}\r\n\
        surface_invalid {\r\n}\r\n\
        surface0 {\r\nname,SurfaceZero\r\ncollision0,0,0,10,10,Head\r\ncollisionex0,Face,rect,0,0,10,10\r\nanimation0.interval,sometimes\r\nelement0,overlay,base.png,0,0\r\npoint.centerx,100\r\nballoon.offsetx,10\r\nballoon.offsety,20\r\notherkey,value\r\n,empty_surf_key\r\nno_comma_surf\r\n}\r\n\
        surface.append0 {\r\nelement1,overlay,top.png,0,0\r\n}\r\n";
    let parsed = parse_surfaces_txt(text);
    assert_eq!(parsed.version, 1);
    assert_eq!(parsed.maxwidth, Some(300));
    assert!(parsed.aliases.contains_key("main"));
    assert!(parsed.kero_aliases.contains_key("kmain"));
    assert!(parsed.surfaces.contains_key(&0));
    let def = parsed.surfaces.get(&0).unwrap();
    assert_eq!(def.name.as_deref(), Some("SurfaceZero"));
    assert_eq!(def.elements.len(), 2);
    assert_eq!(def.points.center_x, Some(100));
    assert_eq!(def.balloon_offsets.get("*").unwrap().x, Some(10));
    assert_eq!(def.balloon_offsets.get("*").unwrap().y, Some(20));
    assert_eq!(def.properties.get("otherkey").unwrap(), "value");
}
