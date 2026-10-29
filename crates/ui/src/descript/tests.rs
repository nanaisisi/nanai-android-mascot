use super::*;

#[test]
fn test_descript_shell_extensions() {
    let sample = "type,shell\r\ncraftmanurl,https://example.ukagaka\r\n\
        sakura.defaultx,120\r\nsakura.defaulty,240\r\n\
        sakura.bindoption.group,服,multiple\r\n\
        sakura.bindgroup100.name,服,和服,thumb.png\r\n\
        sakura.bindgroup100.default,1\r\n\
        sakura.bindgroup100.addid,101,102\r\n\
        kero.bindgroup200.name,帽子,ヘッドドレス\r\n";
    let desc = Descript::parse(sample);

    assert_eq!(desc.type_().map(|s| s.as_str()), Some("shell"));
    assert_eq!(
        desc.craftmanurl().map(|s| s.as_str()),
        Some("https://example.ukagaka")
    );
    let defaults = desc.char_defaults("sakura");
    assert_eq!(defaults.x, Some(120));
    assert_eq!(defaults.y, Some(240));

    let option = desc.bindoption_group("sakura").unwrap();
    assert_eq!(option.category, "服");
    assert_eq!(option.options, vec!["multiple".to_string()]);

    let sakura_groups = desc.bind_groups("sakura");
    assert_eq!(sakura_groups.len(), 1);
    let g = &sakura_groups[0];
    assert_eq!(g.number, 100);
    assert_eq!(g.category, "服");
    assert_eq!(g.part, "和服");
    assert_eq!(g.thumbnail.as_deref(), Some("thumb.png"));
    assert!(g.default);
    assert_eq!(g.add_ids, [101u32, 102]);

    let kero_groups = desc.bind_groups("kero");
    assert_eq!(kero_groups.len(), 1);
    assert_eq!(kero_groups[0].part, "ヘッドドレス");
}

#[test]
fn test_expand_ids_ranges() {
    assert_eq!(parser::expand_ids("0-2,9"), vec![0, 1, 2, 9]);
    assert!(parser::expand_ids("abc").is_empty());
    assert_eq!(parser::expand_ids("[5-3]"), Vec::<u32>::new());
    assert_eq!(parser::expand_ids("[10]"), vec![10]);
}

#[test]
fn test_descript_more_properties() {
    let sample = "# Comment\n// Comment2\n\n\
        name,MockGhost\n\
        sakura.name,Sakura\n\
        kero.name,Kero\n\
        sakura.name2,SakuraSub\n\
        homeurl,https://home.url\n\
        origin.x,10\n\
        origin.y,20\n\
        validrect.left,0\n\
        validrect.top,0\n\
        validrect.right,800\n\
        validrect.bottom,600\n\
        font.color,255,255,255\n\
        icon,icon.png\n\
        craftman,Author\n\
        craftmanurl,https://author.url\n\
        type,ghost\n";
    let desc = Descript::parse(sample);
    assert_eq!(desc.name().unwrap(), "MockGhost");
    assert_eq!(desc.sakura_name().unwrap(), "Sakura");
    assert_eq!(desc.kero_name().unwrap(), "Kero");
    assert_eq!(desc.sakura_names(), (Some(&"Sakura".to_string()), Some(&"SakuraSub".to_string())));
    assert_eq!(desc.homeurl().unwrap(), "https://home.url");
    assert_eq!(desc.origin(), (Some(10), Some(20)));
    assert_eq!(desc.validrect(), (Some(0), Some(0), Some(800), Some(600)));
    assert_eq!(desc.font_color().unwrap(), "255,255,255");
    assert_eq!(desc.icon().unwrap(), "icon.png");
    assert_eq!(desc.craftmanw().unwrap(), "Author");
    assert_eq!(desc.craftmanurl().unwrap(), "https://author.url");
    assert_eq!(desc.type_().unwrap(), "ghost");

    let sample2 = "craftmanw,AuthorW\ncraftman,Author\n";
    let desc2 = Descript::parse(sample2);
    assert_eq!(desc2.craftmanw().unwrap(), "AuthorW");
}

#[test]
fn test_descript_parser_edge_cases() {
    let sample = "sakura.bindgroup0.name,Invalid,Zero\n\
                  sakura.bindgroup10.unknown_field,value\n\
                  sakura.defaultleft,10\n\
                  sakura.defaulttop,20\n";
    let desc = Descript::parse(sample);
    let groups = desc.bind_groups("sakura");
    assert_eq!(groups.len(), 1);
    let defaults = desc.char_defaults("sakura");
    assert_eq!(defaults.left, Some(10));
    assert_eq!(defaults.top, Some(20));
}
