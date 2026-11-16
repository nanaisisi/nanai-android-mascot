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
    if let Some(sub) = q.strip_prefix("system.os.") {
        return match sub {
            "name" | "version" => std::env::consts::OS.to_string(),
            _ => std::env::consts::OS.to_string(),
        };
    }
    if let Some(sub) = q.strip_prefix("system.cpu.") {
        return match sub {
            "num" => std::thread::available_parallelism()
                .map(|n| n.get().to_string())
                .unwrap_or_else(|_| "1".to_string()),
            "vendor" | "name" => std::env::consts::ARCH.to_string(),
            "load" => "0".to_string(),
            "clock" => "0".to_string(),
            "features" => std::env::consts::ARCH.to_string(),
            _ => std::env::consts::ARCH.to_string(),
        };
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
    if let Some(scope_prop) = q.strip_prefix("currentghost.scope(")
        && let Some(idx) = scope_prop.find(").")
    {
        let scope_id = scope_prop[..idx].parse::<u32>().unwrap_or(0);
        let subprop = &scope_prop[idx + 2..];
        return match subprop {
            "name" => match scope_id {
                0 => "Sakura".to_string(),
                1 => "Kero".to_string(),
                n => format!("Char{}", n),
            },
            "rect" => "0,0,280,300".to_string(),
            "x" | "y" => "0".to_string(),
            "scaling" => "100".to_string(),
            "surface.num" => "0".to_string(),
            "seriko.defaultsurface" => "0".to_string(),
            _ => "0".to_string(),
        };
    }
    if let Some(scope_prop) = q.strip_prefix("currentghost.balloon.scope(")
        && let Some(idx) = scope_prop.find(").")
    {
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
    if q.starts_with("currentghost.balloon.") {
        return "1".to_string();
    }
    if (q.starts_with("char") || q.starts_with("sakura") || q.starts_with("kero"))
        && (q.ends_with(".bind.menu") || q.ends_with(".menu"))
    {
        return "auto".to_string();
    }
    if q.starts_with("history.balloon.index(")
        || q.starts_with("history.balloon(")
        || q.starts_with("history.balloon")
    {
        return "1".to_string();
    }
    format!("(unknown property: {})", raw_query)
}
