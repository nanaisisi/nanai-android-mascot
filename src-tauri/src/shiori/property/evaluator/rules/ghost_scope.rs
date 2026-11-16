//! currentghost.scope / currentghost.balloon.scope プロパティ評価モジュール

pub fn evaluate_ghost_scope(q: &str) -> Option<String> {
    if let Some(scope_prop) = q.strip_prefix("currentghost.scope(")
        && let Some(idx) = scope_prop.find(").")
    {
        let scope_id = scope_prop[..idx].parse::<u32>().unwrap_or(0);
        let subprop = &scope_prop[idx + 2..];
        return Some(match subprop {
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
        });
    }

    if let Some(scope_prop) = q.strip_prefix("currentghost.balloon.scope(")
        && let Some(idx) = scope_prop.find(").")
    {
        let subprop = &scope_prop[idx + 2..];
        return Some(match subprop {
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
        });
    }

    None
}
