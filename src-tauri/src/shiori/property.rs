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
        "readmebuttoncaption"
        | "updatebuttoncaption"
        | "vanishbuttoncaption"
        | "vanishbuttonvisible" => "1".to_string(),
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
        assert_eq!(evaluate_property_query("shiori.name"), "SHIORI/3.0 Standard");
        assert_eq!(evaluate_property_query("shiori.encoding"), "UTF-8");
        assert_eq!(
            evaluate_property_query("unknown.prop"),
            "(unknown property: unknown.prop)"
        );
    }
}
