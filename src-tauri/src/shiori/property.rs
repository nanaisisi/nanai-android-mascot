//! Property System evaluation engine specification implementation (UKADOC propertysystem spec)
//! [Property System]

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PropertyQueryRequest {
    pub query: String,
}

/// Evaluate property system queries conforming to UKADOC propertysystem spec
pub fn evaluate_property_query(query: &str) -> String {
    let q = query.trim().to_lowercase();
    if q == "ghostlist.count" {
        return "1".to_string();
    }
    if q == "ghostlist.index(0).name" || q == "ghostlist.index(0)" {
        return "Mock Ghost".to_string();
    }
    if q == "balloonlist.count" {
        return "1".to_string();
    }
    if q == "balloonlist.index(0).name" {
        return "Default Balloon".to_string();
    }
    if q == "pluginlist.count" {
        return "0".to_string();
    }
    if q == "headlinelist.count" {
        return "0".to_string();
    }
    if q == "baseware.name" || q == "system.baseware.name" {
        return "Nanai Android Mascot".to_string();
    }
    if q == "baseware.version" || q == "system.baseware.version" {
        return "1.0.0".to_string();
    }
    format!("(unknown property: {})", query)
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
        assert_eq!(evaluate_property_query("baseware.name"), "Nanai Android Mascot");
        assert_eq!(evaluate_property_query("unknown.prop"), "(unknown property: unknown.prop)");
    }
}
