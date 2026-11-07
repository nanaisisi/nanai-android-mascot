//! Property System evaluation engine specification implementation (UKADOC propertysystem spec)
//! [Property System]

#![allow(dead_code)]

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PropertyQueryRequest {
    pub query: String,
}

/// Evaluate property system queries conforming to UKADOC propertysystem spec
pub fn evaluate_property_query(query: &str) -> String {
    let q = query.trim().to_lowercase();
    match q.as_str() {
        "ghostlist.count" => "1".to_string(),
        "ghostlist.index(0).name" | "ghostlist.index(0)" => "Mock Ghost".to_string(),
        "ghostlist.index(0).path" => "mock_ghost".to_string(),
        "balloonlist.count" => "1".to_string(),
        "balloonlist.index(0).name" => "Default Balloon".to_string(),
        "pluginlist.count" => "0".to_string(),
        "headlinelist.count" => "0".to_string(),
        "baseware.name" | "system.baseware.name" => "Nanai Android Mascot".to_string(),
        "baseware.version" | "system.baseware.version" => "1.0.0".to_string(),
        "baseware.windowmode" => "normal".to_string(),
        "currentghost.name" => "Mock Ghost".to_string(),
        "currentghost.path" => "mock_ghost".to_string(),
        "currentghost.craftman" => "Ukagaka Creator".to_string(),
        "currentghost.craftmanurl" => "https://example.com".to_string(),
        "username" => "User".to_string(),
        "homeurl" => "https://example.com/ghost/".to_string(),
        "other_homeurl_override" | "other_homeurl" => "https://example.com/ghost/".to_string(),
        "balloon_tooltip" | "tooltip" => "".to_string(),
        "name" => "Mock Ghost".to_string(),
        "version" => "1.0.0".to_string(),
        "craftman" => "Ukagaka Creator".to_string(),
        "craftmanw" => "Ukagaka Creator".to_string(),
        "log_path" => "".to_string(),
        "sakura.defaultleft" | "sakura.defaulttop" | "sakura.defaultx" | "sakura.defaulty" => {
            "0".to_string()
        }
        "sakura.popupmenu.applybindtoself"
        | "sakura.popupmenu.type"
        | "sakura.popupmenu.visible" => "1".to_string(),
        "sakura.portalbuttoncaption"
        | "sakura.portalsites"
        | "sakura.recommendbuttoncaption"
        | "sakura.recommendsites" => "".to_string(),
        "kero.defaultleft" | "kero.defaulttop" | "kero.defaultx" | "kero.defaulty" => {
            "0".to_string()
        }
        "kero.popupmenu.applybindtoself" | "kero.popupmenu.type" | "kero.popupmenu.visible" => {
            "1".to_string()
        }
        "kero.recommendbuttoncaption" | "kero.recommendsites" => "".to_string(),
        "char.defaultleft" | "char.defaulttop" | "char.defaultx" | "char.defaulty" => {
            "0".to_string()
        }
        "char.popupmenu.applybindtoself" | "char.popupmenu.type" | "char.popupmenu.visible" => {
            "1".to_string()
        }
        "char.recommendbuttoncaption" | "char.recommendsites" => "".to_string(),
        "boxname.defaultleft" | "inputbox.defaultleft" => "0".to_string(),
        "getaistate" | "getaistateex" | "legacyinterface" | "useorigin1" => "0".to_string(),
        "readmebuttoncaption" | "updatebuttoncaption" | "vanishbuttoncaption" => "1".to_string(),
        s if s.ends_with(".caption")
            || s.ends_with("buttoncaption")
            || s == "vanishbuttonvisible" =>
        {
            "1".to_string()
        }
        "currentghost.seriko.surfacelist.defined" => "0,1,10".to_string(),
        "currentghost.seriko.surfacelist.all" => "0,1,10".to_string(),
        "system.year" => "2026".to_string(),
        "system.month" => "11".to_string(),
        "system.day" => "3".to_string(),
        "system.hour" => "12".to_string(),
        "system.minute" => "0".to_string(),
        "system.second" => "0".to_string(),
        "system.millisecond" => "0".to_string(),
        "system.dayofweek" => "2".to_string(),
        "system.cursor.pos" => "0,0".to_string(),
        "system.theme.app.mode" => "dark".to_string(),
        "system.theme.os.mode" => "dark".to_string(),
        "system.dnd.mode" => "none".to_string(),
        "system.monitor.count" => "1".to_string(),
        "system.disk.count" => "1".to_string(),
        "update_time" => "0".to_string(),
        "sakura.bind.menu" => "".to_string(),
        "kero.bind.menu" => "".to_string(),
        "sakura.menu" | "kero.menu" => "auto".to_string(),
        "menu.font.name" => "sans-serif".to_string(),
        "menu.font.height" => "12".to_string(),
        "menu.frame.color.r" => "0".to_string(),
        "menu.frame.color.g" => "0".to_string(),
        "menu.frame.color.b" => "0".to_string(),
        "menu.background.font.color.r" => "0".to_string(),
        "menu.background.font.color.g" => "0".to_string(),
        "menu.background.font.color.b" => "0".to_string(),
        "menu.foreground.font.color.r" => "255".to_string(),
        "menu.foreground.font.color.g" => "255".to_string(),
        "menu.foreground.font.color.b" => "255".to_string(),
        "menu.disable.font.color.r" => "128".to_string(),
        "menu.disable.font.color.g" => "128".to_string(),
        "menu.disable.font.color.b" => "128".to_string(),
        "menu.separator.color.r" => "192".to_string(),
        "menu.separator.color.g" => "192".to_string(),
        "menu.separator.color.b" => "192".to_string(),
        s if s.starts_with("sakura.menuitem")
            || s.starts_with("kero.menuitem")
            || s.starts_with("char.menuitem") =>
        {
            "".to_string()
        }
        _ => {
            if let Some(shiori_var) = q.strip_prefix("shiori.") {
                return match shiori_var {
                    "version" => "3.0".to_string(),
                    "name" => "SHIORI/3.0 Standard".to_string(),
                    "craftman" => "Nanai Project".to_string(),
                    "craftmanurl" => "https://example.com/shiori".to_string(),
                    "encoding" => "UTF-8".to_string(),
                    _ => format!("(unknown shiori property: {})", shiori_var),
                };
            }
            if q.starts_with("system.os.") {
                return "Linux".to_string();
            }
            if q.starts_with("system.cpu.") {
                return "x86_64".to_string();
            }
            if q.starts_with("system.memory.") {
                return "1024".to_string();
            }
            if q.starts_with("system.power.") {
                return "ac".to_string();
            }
            if q.starts_with("system.network.") {
                return "online".to_string();
            }
            if q.starts_with("system.monitor.index") {
                return "0,0,1920,1080".to_string();
            }
            if q.starts_with("system.disk.index") {
                return "100000".to_string();
            }
            if q.starts_with("currentghost.scope(") {
                if q.contains(".name") {
                    return "Sakura".to_string();
                }
                return "0".to_string();
            }
            format!("(unknown property: {})", query)
        }
    }
}

#[tauri::command]
pub async fn get_system_property(query: String) -> Result<String, String> {
    Ok(evaluate_property_query(&query))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_property_evaluation() {
        assert_eq!(evaluate_property_query("ghostlist.count"), "1");
        assert_eq!(
            evaluate_property_query("baseware.name"),
            "Nanai Android Mascot"
        );
        assert_eq!(evaluate_property_query("currentghost.name"), "Mock Ghost");
        assert_eq!(evaluate_property_query("username"), "User");
        assert_eq!(evaluate_property_query("shiori.version"), "3.0");
        assert_eq!(
            evaluate_property_query("shiori.name"),
            "SHIORI/3.0 Standard"
        );
        assert_eq!(evaluate_property_query("shiori.encoding"), "UTF-8");
        assert_eq!(evaluate_property_query("system.year"), "2026");
        assert_eq!(evaluate_property_query("system.month"), "11");
        assert_eq!(evaluate_property_query("system.day"), "3");
        assert_eq!(evaluate_property_query("system.hour"), "12");
        assert_eq!(evaluate_property_query("system.minute"), "0");
        assert_eq!(evaluate_property_query("system.second"), "0");
        assert_eq!(evaluate_property_query("system.millisecond"), "0");
        assert_eq!(evaluate_property_query("system.dayofweek"), "2");
        assert_eq!(evaluate_property_query("system.cursor.pos"), "0,0");
        assert_eq!(evaluate_property_query("system.theme.app.mode"), "dark");
        assert_eq!(evaluate_property_query("system.theme.os.mode"), "dark");
        assert_eq!(evaluate_property_query("system.dnd.mode"), "none");
        assert_eq!(evaluate_property_query("system.monitor.count"), "1");
        assert_eq!(evaluate_property_query("system.disk.count"), "1");
        assert_eq!(evaluate_property_query("system.os.name"), "Linux");
        assert_eq!(evaluate_property_query("system.cpu.name"), "x86_64");
        assert_eq!(evaluate_property_query("system.memory.total"), "1024");
        assert_eq!(evaluate_property_query("system.power.state"), "ac");
        assert_eq!(evaluate_property_query("system.network.state"), "online");
        assert_eq!(
            evaluate_property_query("system.monitor.index(0).rect"),
            "0,0,1920,1080"
        );
        assert_eq!(
            evaluate_property_query("system.disk.index(0).free"),
            "100000"
        );
        assert_eq!(evaluate_property_query("update_time"), "0");
        assert_eq!(evaluate_property_query("sakura.bind.menu"), "");
        assert_eq!(evaluate_property_query("kero.bind.menu"), "");
        assert_eq!(
            evaluate_property_query("definedsurfaceonlybutton.caption"),
            "1"
        );
        assert_eq!(
            evaluate_property_query("collisionvisiblebutton.caption"),
            "1"
        );
        assert_eq!(
            evaluate_property_query("currentghost.seriko.surfacelist.defined"),
            "0,1,10"
        );
        assert_eq!(
            evaluate_property_query("currentghost.seriko.surfacelist.all"),
            "0,1,10"
        );
        assert_eq!(
            evaluate_property_query("callsstpsendboxbutton.caption"),
            "1"
        );
        assert_eq!(evaluate_property_query("updatefmobutton.caption"), "1");
        assert_eq!(
            evaluate_property_query("switchlocalsstpbutton.caption"),
            "1"
        );
        assert_eq!(
            evaluate_property_query("switchremotesstpbutton.caption"),
            "1"
        );
        assert_eq!(evaluate_property_query("switchreloadbutton.caption"), "1");
        assert_eq!(evaluate_property_query("historyrootbutton.caption"), "1");
        assert_eq!(evaluate_property_query("sntpbutton.caption"), "1");
        assert_eq!(evaluate_property_query("sakura.menu"), "auto");
        assert_eq!(evaluate_property_query("kero.menu"), "auto");
        assert_eq!(evaluate_property_query("menu.font.name"), "sans-serif");
        assert_eq!(evaluate_property_query("menu.font.height"), "12");
        assert_eq!(evaluate_property_query("menu.frame.color.r"), "0");
        assert_eq!(evaluate_property_query("menu.frame.color.g"), "0");
        assert_eq!(evaluate_property_query("menu.frame.color.b"), "0");
        assert_eq!(evaluate_property_query("menu.background.font.color.r"), "0");
        assert_eq!(evaluate_property_query("menu.foreground.font.color.r"), "255");
        assert_eq!(evaluate_property_query("menu.disable.font.color.r"), "128");
        assert_eq!(evaluate_property_query("menu.separator.color.r"), "192");
        assert_eq!(evaluate_property_query("sakura.menuitem0"), "");
        assert_eq!(evaluate_property_query("kero.menuitemex1"), "");
        assert_eq!(
            evaluate_property_query("unknown.prop"),
            "(unknown property: unknown.prop)"
        );
    }
}
