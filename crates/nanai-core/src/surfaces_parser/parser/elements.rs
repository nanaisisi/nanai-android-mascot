//! レイヤー要素 (elementN,method,file,x,y) 行パース処理

use crate::surface_compositor::SurfaceElement;
use std::collections::BTreeMap;

pub fn parse_element_line(
    trimmed: &str,
    current_surfaces: &[String],
    elements: &mut BTreeMap<String, Vec<SurfaceElement>>,
) {
    let parts: Vec<&str> = trimmed.split(',').map(|s| s.trim()).collect();
    if parts.len() >= 5
        && let Ok(id) = parts[0]
            .trim_start_matches(|c: char| !c.is_ascii_digit())
            .parse::<u32>()
    {
        let method = parts[1].to_ascii_lowercase();
        let file = parts[2].to_string();
        let x = parts[3].parse::<i32>().unwrap_or(0);
        let y = parts[4].parse::<i32>().unwrap_or(0);

        let elem = SurfaceElement {
            id,
            file,
            method,
            x,
            y,
        };

        for s in current_surfaces {
            elements.entry(s.clone()).or_default().push(elem.clone());
        }
    }
}
