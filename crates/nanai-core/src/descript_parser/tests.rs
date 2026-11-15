use super::*;

#[test]
fn test_parse_descript_text_basic() {
    let content = "type,ghost\nname,Emily\ncraftman,Nanai\nhomeurl,https://example.com\ncharset,Shift_JIS\n# comment\nshiori,yaya.dll\n";
    let manifest = parse_descript_text(content);

    assert_eq!(manifest.get("type"), Some("ghost"));
    assert_eq!(manifest.get("name"), Some("Emily"));
    assert_eq!(manifest.get("craftman"), Some("Nanai"));
    assert_eq!(manifest.get("shiori"), Some("yaya.dll"));

    // Helper methods compliance
    assert_eq!(manifest.resource_type(), Some("ghost"));
    assert_eq!(manifest.name(), Some("Emily"));
    assert_eq!(manifest.craftman(), Some("Nanai"));
    assert_eq!(manifest.shiori(), Some("yaya.dll"));
    assert_eq!(manifest.home_url(), Some("https://example.com"));
    assert_eq!(manifest.charset(), Some("Shift_JIS"));
}

#[test]
fn test_parse_descript_text_equals() {
    let content = "charset=UTF-8\nmenu.background.bitmap=menu_bg.png\n";
    let manifest = parse_descript_text(content);

    assert_eq!(manifest.get("charset"), Some("UTF-8"));
    assert_eq!(manifest.get("menu.background.bitmap"), Some("menu_bg.png"));
}

#[test]
fn test_parse_descript_ukadoc_official_properties() {
    let content = "title,Emily Ghost\nsakura.name,Sakura\nkero.name,Kero\nshiori.version,3.0\nicon,icon.ico\nreadme,readme.txt\ninstall.accept,GhostA, GhostB ,GhostC\ncraftmanurl,https://example.com/author\ncraftmanw,AuthorEn\ngithubrepo,user/repo\nsakura.seriko.defaultsurface,0\nkero.seriko.defaultsurface,10\nseriko.alignmenttodesktop,bottom\nsstp.allowcommunicate,1\n";
    let manifest = parse_descript_text(content);

    assert_eq!(manifest.title(), Some("Emily Ghost"));
    assert_eq!(manifest.sakura_name(), Some("Sakura"));
    assert_eq!(manifest.kero_name(), Some("Kero"));
    assert_eq!(manifest.shiori_version(), Some("3.0"));
    assert_eq!(manifest.icon(), Some("icon.ico"));
    assert_eq!(manifest.readme(), Some("readme.txt"));
    assert_eq!(
        manifest.accept_list(),
        vec![
            "GhostA".to_string(),
            "GhostB".to_string(),
            "GhostC".to_string()
        ]
    );
    assert_eq!(manifest.craftman_url(), Some("https://example.com/author"));
    assert_eq!(manifest.craftman_w(), Some("AuthorEn"));
    assert_eq!(manifest.github_repo(), Some("user/repo"));
    assert_eq!(manifest.sakura_default_surface(), Some(0));
    assert_eq!(manifest.kero_default_surface(), Some(10));
    assert_eq!(manifest.alignment_to_desktop(), Some("bottom"));
    assert!(manifest.is_sstp_communicate_allowed());
}

#[test]
fn test_parse_descript_shell_and_coordinates() {
    let content = "sakura.defaultx,100\nsakura.defaulty,200\nkero.defaultx,300\nkero.defaulty,400\nmenu.background.bitmap.filename,bg.png\n";
    let manifest = parse_descript_text(content);

    assert_eq!(manifest.sakura_default_pos(), Some((100, 200)));
    assert_eq!(manifest.kero_default_pos(), Some((300, 400)));
    assert_eq!(manifest.menu_background_bitmap(), Some("bg.png"));
}

#[test]
fn test_parse_descript_balloon_detailed_properties() {
    let content = "font.name,Meiryo\nfont.height,14\nfont.color.r,255\nfont.color.g,128\nfont.color.b,64\nvalidrect.left,10\nvalidrect.top,20\nvalidrect.right,200\nvalidrect.bottom,150\norigin.x,5\norigin.y,10\nwordwrappoint.x,180\n";
    let manifest = parse_descript_text(content);

    assert_eq!(manifest.font_name(), Some("Meiryo"));
    assert_eq!(manifest.font_height(), Some(14));
    assert_eq!(manifest.font_color_rgb(), Some((255, 128, 64)));
    assert_eq!(manifest.valid_rect(), Some((10, 20, 200, 150)));
    assert_eq!(manifest.origin_pos(), Some((5, 10)));
    assert_eq!(manifest.word_wrap_point(), Some(180));
}
