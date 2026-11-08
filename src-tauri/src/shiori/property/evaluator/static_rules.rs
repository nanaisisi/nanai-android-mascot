//! 完全一致型システムプロパティ評価モジュール

pub(super) fn evaluate_static_property(q: &str) -> Option<String> {
    let val = match q {
        "ghostlist.count" => "1",
        "ghostlist.index(0).name" | "ghostlist.index(0)" => "Mock Ghost",
        "ghostlist.index(0).path" => "mock_ghost",
        "balloonlist.count" => "1",
        "balloonlist.index(0).name" | "balloonlist.index(0)" => "Default Balloon",
        "balloonlist.index(0).path" => "default_balloon",
        "currentghost.balloon.count" => "1",
        "currentghost.balloon.name" => "Default Balloon",
        "currentghost.balloon.path" => "default_balloon",
        "currentghost.balloon.mousecursor.arrow" => "arrow.cur",
        "currentghost.balloon.mousecursor.text" => "text.cur",
        "currentghost.balloon.mousecursor.wait" => "wait.cur",
        "currentghost.balloon.mousecursor" => "arrow.cur",
        "history.balloon.count" => "1",
        "history.balloon.index(0).name" | "history.balloon.index(0)" => "Default Balloon",
        "pluginlist.count" => "0",
        "headlinelist.count" => "0",
        "baseware.name" | "system.baseware.name" => "Nanai Android Mascot",
        "baseware.version" | "system.baseware.version" => "1.0.0",
        "baseware.windowmode" => "normal",
        "currentghost.name" => "Mock Ghost",
        "currentghost.path" => "mock_ghost",
        "currentghost.craftman" => "Ukagaka Creator",
        "currentghost.craftmanurl" => "https://example.com",
        "username" => "User",
        "homeurl" => "https://example.com/ghost/",
        "other_homeurl_override" | "other_homeurl" => "https://example.com/ghost/",
        "balloon_tooltip" | "tooltip" => "",
        "name" => "Mock Ghost",
        "version" => "1.0.0",
        "craftman" => "Ukagaka Creator",
        "craftmanw" => "Ukagaka Creator",
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
        "system.year" => "2026",
        "system.month" => "11",
        "system.day" => "3",
        "system.hour" => "12",
        "system.minute" => "0",
        "system.second" => "0",
        "system.millisecond" => "0",
        "system.dayofweek" => "2",
        "system.cursor.pos" => "0,0",
        "system.theme.app.mode" => "dark",
        "system.theme.os.mode" => "dark",
        "system.dnd.mode" => "none",
        "system.monitor.count" => "1",
        "system.disk.count" => "1",
        "update_time" => "0",
        "sakura.bind.menu" => "",
        "kero.bind.menu" => "",
        "sakura.menu" | "kero.menu" => "auto",
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
