//! 接頭辞・パターン一致型動的プロパティ評価モジュール

pub(super) fn evaluate_dynamic_property(q: &str, raw_query: &str) -> String {
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
    if let Some(scope_prop) = q.strip_prefix("currentghost.balloon.scope(") {
        if let Some(idx) = scope_prop.find(").") {
            let subprop = &scope_prop[idx + 2..];
            return match subprop {
                "x" | "y" | "basepos.x" | "basepos.y" => "0".to_string(),
                "rect" => "0,0,280,100".to_string(),
                "num" | "count" => "1".to_string(),
                "lines" | "lines.initial" => "4".to_string(),
                "validwidth" | "validwidth.initial" => "260".to_string(),
                "validheight" | "validheight.initial" => "80".to_string(),
                "char_width" => "12".to_string(),
                "background.color" => "255,255,255".to_string(),
                "vertical" => "0".to_string(),
                "scaling" => "100".to_string(),
                _ => "0".to_string(),
            };
        }
    }
    if q.starts_with("currentghost.balloon.") {
        return "1".to_string();
    }
    if q.starts_with("history.balloon.index(")
        || q.starts_with("history.balloon(")
        || q.starts_with("history.balloon")
    {
        return "1".to_string();
    }
    format!("(unknown property: {})", raw_query)
}
