//! 完全一致型システムプロパティ評価モジュール

pub(super) fn evaluate_static_property(q: &str) -> Option<String> {
    let val = match q {
        "ghostlist.count" => "0",
        "ghostlist.index(0).name" | "ghostlist.index(0)" => "",
        "ghostlist.index(0).path" => "",
        "balloonlist.count" => "0",
        "balloonlist.index(0).name" | "balloonlist.index(0)" => "",
        "balloonlist.index(0).path" => "",
        "currentghost.balloon.count" => "0",
        "currentghost.balloon.name" => "",
        "currentghost.balloon.path" => "",
        "currentghost.balloon.mousecursor.arrow" => "",
        "currentghost.balloon.mousecursor.text" => "",
        "currentghost.balloon.mousecursor.wait" => "",
        "currentghost.balloon.mousecursor.grip" => "",
        "currentghost.balloon.mousecursor.hand" => "",
        "currentghost.balloon.mousecursor" => "",
        "history.balloon.count" => "0",
        "history.balloon.index(0).name" | "history.balloon.index(0)" => "",
        "pluginlist.count" => "0",
        "headlinelist.count" => "0",
        "currentghost.name" => "",
        "currentghost.path" => "",
        "currentghost.craftman" => "",
        "currentghost.craftmanurl" => "",
        "username" => "",
        "homeurl" => "",
        "other_homeurl_override" | "other_homeurl" => "",
        "balloon_tooltip" | "tooltip" => "",
        "name" => "",
        "sakuraname" | "sakura.name" => "",
        "version" => "",
        "craftman" => "",
        "craftmanw" => "",
        "thumbnail" => "",
        "update_result" => "",
        "log_path" => "",
        "sakura.defaultleft" | "sakura.defaulttop" | "sakura.defaultx" | "sakura.defaulty" => "0",
        "sakura.popupmenu.applybindtoself"
        | "sakura.popupmenu.type"
        | "sakura.popupmenu.visible" => "1",
        "sakura.portalbuttoncaption"
        | "sakura.portalsites"
        | "sakura.recommendbuttoncaption"
        | "sakura.recommendsites" => "",
        "kero.defaultleft" | "kero.defaulttop" | "kero.defaultx" | "kero.defaulty" => "0",
        "kero.popupmenu.applybindtoself" | "kero.popupmenu.type" | "kero.popupmenu.visible" => "1",
        "kero.recommendbuttoncaption" | "kero.recommendsites" => "",
        "char.defaultleft" | "char.defaulttop" | "char.defaultx" | "char.defaulty" => "0",
        "char.popupmenu.applybindtoself" | "char.popupmenu.type" | "char.popupmenu.visible" => "1",
        "char.recommendbuttoncaption" | "char.recommendsites" => "",
        "boxname.defaultleft" | "inputbox.defaultleft" => "0",
        "getaistate" | "getaistateex" | "legacyinterface" | "useorigin1" => "0",
        "readmebuttoncaption" | "updatebuttoncaption" | "vanishbuttoncaption" => "1",
        "currentghost.seriko.surfacelist.defined" => "0,1,10",
        "currentghost.seriko.surfacelist.all" => "0,1,10",
        "currentghost.seriko.zorder" => "",
        "currentghost.seriko.sticky-window" => "",
        "currentghost.status" => "",
        "currentghost.sound.count" => "0",
        "update_time" => "",
        "sakura.bind.menu" | "kero.bind.menu" | "sakura.menu" | "kero.menu" => "auto",
        "menu.font.name" => "sans-serif",
        "menu.font.height" => "12",
        "menu.frame.color.r" => "0",
        "menu.frame.color.g" => "0",
        "menu.frame.color.b" => "0",
        "menu.background.font.color.r" => "0",
        "menu.background.font.color.g" => "0",
        "menu.background.font.color.b" => "0",
        "menu.foreground.font.color.r" => "255",
        "menu.foreground.font.color.g" => "255",
        "menu.foreground.font.color.b" => "255",
        "menu.disable.font.color.r" => "128",
        "menu.disable.font.color.g" => "128",
        "menu.disable.font.color.b" => "128",
        "menu.separator.color.r" => "192",
        "menu.separator.color.g" => "192",
        "menu.separator.color.b" => "192",
        _ => {
            if q.ends_with(".caption") || q.ends_with("buttoncaption") || q == "vanishbuttonvisible"
            {
                "1"
            } else if q.starts_with("sakura.menuitem")
                || q.starts_with("kero.menuitem")
                || q.starts_with("char.menuitem")
            {
                ""
            } else {
                return None;
            }
        }
    };
    Some(val.to_string())
}
