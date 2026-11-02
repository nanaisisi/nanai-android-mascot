//! アニメーション (`animation`) ハンドラー

use super::collision::{parse_collision_area, parse_collisionex_area};
use super::utils::split_id_suffix;
use crate::surfaces::types::*;

pub(crate) fn apply_animation_line(txt: &mut SurfacesTxt, ids: &[u32], rest: &str, value: &str) {
    let Some((id_part, field)) = rest.split_once('.') else {
        return;
    };
    let Ok(id) = id_part.trim().parse::<u32>() else {
        return;
    };
    let field = field.trim();
    let field_lower = field.to_lowercase();

    for num in ids {
        let def = txt.surfaces.entry(*num).or_default();
        let anim = def.animations.entry(id).or_default();
        anim.id = id;

        if field_lower == "interval" {
            anim.interval = Some(Interval::parse(value));
        } else if field_lower.starts_with("name") {
            anim.name = Some(value.trim().to_string());
        } else if field_lower.starts_with("option") {
            anim.options
                .push(value.split(',').map(|t| t.trim().to_string()).collect());
        } else if let Some(collision_part) = field_lower.strip_prefix("collisionex") {
            if let Some(area) = parse_collisionex_area(collision_part, value) {
                anim.collisions.push(area);
            }
        } else if let Some(collision_part) = field_lower.strip_prefix("collision") {
            if let Some(area) = parse_collision_area(collision_part, value) {
                anim.collisions.push(area);
            }
        } else if field_lower.starts_with("pattern") {
            let index = if field_lower == "pattern" {
                anim.patterns.len() as u32
            } else {
                split_id_suffix(&field["pattern".len()..]).1.unwrap_or(0)
            };
            let mut tokens: Vec<String> = Vec::new();
            let mut current = String::new();
            let mut depth_paren = 0;
            let mut depth_bracket = 0;
            for ch in value.chars() {
                match ch {
                    '(' => {
                        depth_paren += 1;
                        current.push(ch);
                    }
                    ')' => {
                        if depth_paren > 0 {
                            depth_paren -= 1;
                        }
                        current.push(ch);
                    }
                    '[' => {
                        depth_bracket += 1;
                        current.push(ch);
                    }
                    ']' => {
                        if depth_bracket > 0 {
                            depth_bracket -= 1;
                        }
                        current.push(ch);
                    }
                    ',' if depth_paren == 0 && depth_bracket == 0 => {
                        tokens.push(current.trim().to_string());
                        current.clear();
                    }
                    _ => {
                        current.push(ch);
                    }
                }
            }
            if !current.trim().is_empty() {
                tokens.push(current.trim().to_string());
            }

            let first = tokens.first().map(|s| s.as_str()).unwrap_or("");
            let second = tokens.get(1).map(|s| s.as_str()).unwrap_or("");
            let method = if tokens.len() >= 2
                && (first == "start"
                    || first == "stop"
                    || first == "alternativestart"
                    || first == "alternativestop"
                    || first == "parallelstart"
                    || first == "parallelstop")
            {
                DrawMethod::parse(&format!("{first},{second}"))
            } else {
                DrawMethod::parse(first)
            };

            let (wait, wait_max) = tokens
                .get(2)
                .and_then(|t| {
                    let (low, high) = match t.split_once('-') {
                        Some((low, high)) => (low, high),
                        None => (t.as_str(), ""),
                    };
                    let low = low.parse::<u32>().ok()?;
                    let high = high.parse::<u32>().ok();
                    match high {
                        Some(h) if h >= low => Some((low, Some(h))),
                        Some(_) => Some((low, Some(low))),
                        None => Some((low, None)),
                    }
                })
                .unwrap_or((0, None));
            let pattern = AnimationPattern {
                index,
                method,
                surface: tokens.get(1).and_then(|t| t.parse().ok()).unwrap_or(0),
                wait,
                wait_max,
                x: tokens.get(3).and_then(|t| t.parse().ok()).unwrap_or(0),
                y: tokens.get(4).and_then(|t| t.parse().ok()).unwrap_or(0),
                options: tokens.iter().skip(5).map(|t| t.to_string()).collect(),
            };
            anim.patterns.push(pattern);
        }
    }
}
