//! `surfaces.txt` (UKADOC / SSP 仕様準拠) 高速パーサーモジュール
//! サーフィス定義、要素レイヤー、アニメーション、衝突判定領域を一括パース

use crate::surface_collision::{CollisionArea, CollisionShape};
use crate::surface_compositor::SurfaceElement;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use tsify::Tsify;
use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct ParsedSurfacesManifest {
    pub elements: BTreeMap<String, Vec<SurfaceElement>>,
    pub collisions: BTreeMap<String, Vec<CollisionArea>>,
    pub collision_sort: String,
    pub animation_sort: String,
}

/// surfaceN,surface.appendN 等のヘッダー行からサーフィスID一覧を展開
fn parse_surface_header(trimmed: &str) -> Option<Vec<String>> {
    let lower = trimmed.to_ascii_lowercase();
    if !lower.starts_with("surface") {
        return None;
    }

    let rest = if lower.starts_with("surface.append") {
        &trimmed["surface.append".len()..]
    } else if lower.starts_with("surface") {
        &trimmed["surface".len()..]
    } else {
        return None;
    };

    let rest = rest.trim();
    if rest.is_empty() {
        return None;
    }

    let mut result = Vec::new();
    for part in rest.split(',') {
        let p = part.trim();
        if p.contains('-')
            && let Some((start_s, end_s)) = p.split_once('-')
            && let (Ok(start), Ok(end)) =
                (start_s.trim().parse::<u32>(), end_s.trim().parse::<u32>())
        {
            for i in start..=end {
                result.push(i.to_string());
            }
            continue;
        }
        if let Ok(num) = p.parse::<u32>() {
            result.push(num.to_string());
        }
    }

    if result.is_empty() {
        None
    } else {
        Some(result)
    }
}

/// `surfaces.txt` のテキスト文字列を高速に構造化パース
pub fn parse_surfaces_txt(text: &str) -> ParsedSurfacesManifest {
    let mut elements: BTreeMap<String, Vec<SurfaceElement>> = BTreeMap::new();
    let mut collisions: BTreeMap<String, Vec<CollisionArea>> = BTreeMap::new();
    let mut collision_sort = "none".to_string();
    let mut animation_sort = "none".to_string();

    let mut current_surfaces: Vec<String> = vec!["default".to_string()];

    for line in text.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() || trimmed.starts_with("//") || trimmed == "{" || trimmed == "}" {
            continue;
        }

        // surfaceN, surface.appendN 等のブロックヘッダー判定
        if let Some(targets) = parse_surface_header(trimmed) {
            current_surfaces = targets;
            continue;
        }

        // collision-sort / animation-sort 判定
        if let Some((key, val)) = trimmed.split_once(',') {
            let k_norm = key.trim().to_ascii_lowercase();
            let v_norm = val.trim().to_ascii_lowercase();
            if k_norm == "collision-sort" || k_norm == "collision.sort" {
                collision_sort = v_norm;
                continue;
            } else if k_norm == "animation-sort" || k_norm == "animation.sort" {
                animation_sort = v_norm;
                continue;
            }
        }

        // elementN,method,file,x,y 行のパース
        if trimmed.to_ascii_lowercase().starts_with("element") {
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

                for s in &current_surfaces {
                    elements.entry(s.clone()).or_default().push(elem.clone());
                }
            }
            continue;
        }

        // collisionexN,name,shape,x1,y1,... 行のパース (UKADOC仕様)
        if trimmed.to_ascii_lowercase().starts_with("collisionex") {
            let parts: Vec<&str> = trimmed.split(',').map(|s| s.trim()).collect();
            if parts.len() >= 3 {
                let id = parts[0]
                    .trim_start_matches(|c: char| !c.is_ascii_digit())
                    .parse::<i32>()
                    .unwrap_or(0);
                let name = parts[1].to_ascii_lowercase();
                let shape_type = parts[2].to_ascii_lowercase();

                let shape = match shape_type.as_str() {
                    "rect" | "box" => {
                        if parts.len() >= 7 {
                            let x1 = parts[3].parse::<i32>().unwrap_or(0);
                            let y1 = parts[4].parse::<i32>().unwrap_or(0);
                            let x2 = parts[5].parse::<i32>().unwrap_or(0);
                            let y2 = parts[6].parse::<i32>().unwrap_or(0);
                            Some(CollisionShape::Rect { x1, y1, x2, y2 })
                        } else {
                            None
                        }
                    }
                    "circle" => {
                        if parts.len() >= 6 {
                            let cx = parts[3].parse::<i32>().unwrap_or(0);
                            let cy = parts[4].parse::<i32>().unwrap_or(0);
                            let r = parts[5].parse::<i32>().unwrap_or(0);
                            Some(CollisionShape::Circle { cx, cy, r })
                        } else {
                            None
                        }
                    }
                    "ellipse" => {
                        if parts.len() >= 7 {
                            let cx = parts[3].parse::<i32>().unwrap_or(0);
                            let cy = parts[4].parse::<i32>().unwrap_or(0);
                            let rx = parts[5].parse::<i32>().unwrap_or(0);
                            let ry = parts[6].parse::<i32>().unwrap_or(0);
                            Some(CollisionShape::Ellipse { cx, cy, rx, ry })
                        } else {
                            None
                        }
                    }
                    "polygon" => {
                        let mut vertices = Vec::new();
                        let mut i = 3;
                        while i + 1 < parts.len() {
                            if let (Ok(vx), Ok(vy)) =
                                (parts[i].parse::<i32>(), parts[i + 1].parse::<i32>())
                            {
                                vertices.push((vx, vy));
                            }
                            i += 2;
                        }
                        if vertices.len() >= 3 {
                            Some(CollisionShape::Polygon { vertices })
                        } else {
                            None
                        }
                    }
                    _ => None,
                };

                if let Some(shape) = shape {
                    let col = CollisionArea {
                        id: Some(id),
                        name,
                        shape,
                    };

                    for s in &current_surfaces {
                        collisions.entry(s.clone()).or_default().push(col.clone());
                    }
                }
            }
            continue;
        }

        // collisionN,x1,y1,x2,y2,name 行のパース
        if trimmed.to_ascii_lowercase().starts_with("collision") {
            let parts: Vec<&str> = trimmed.split(',').map(|s| s.trim()).collect();
            if parts.len() >= 6 {
                let id = parts[0]
                    .trim_start_matches(|c: char| !c.is_ascii_digit())
                    .parse::<i32>()
                    .unwrap_or(0);
                let x1 = parts[1].parse::<i32>().unwrap_or(0);
                let y1 = parts[2].parse::<i32>().unwrap_or(0);
                let x2 = parts[3].parse::<i32>().unwrap_or(0);
                let y2 = parts[4].parse::<i32>().unwrap_or(0);
                let name = parts[5].to_ascii_lowercase();

                let col = CollisionArea {
                    id: Some(id),
                    name,
                    shape: CollisionShape::Rect { x1, y1, x2, y2 },
                };

                for s in &current_surfaces {
                    collisions.entry(s.clone()).or_default().push(col.clone());
                }
            }
        }
    }

    ParsedSurfacesManifest {
        elements,
        collisions,
        collision_sort,
        animation_sort,
    }
}

#[wasm_bindgen]
pub fn wasm_parse_surfaces_txt(text: &str) -> Result<JsValue, JsValue> {
    let manifest = parse_surfaces_txt(text);
    Ok(serde_wasm_bindgen::to_value(&manifest)?)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_surfaces_txt_basic() {
        let input = r#"
surface0,1
element0,base,surface0.png,0,0
element1,overlay,eye.png,10,20
collision0,10,10,50,50,head
"#;
        let manifest = parse_surfaces_txt(input);
        assert_eq!(manifest.elements.len(), 2);
        assert!(manifest.elements.contains_key("0"));
        assert!(manifest.elements.contains_key("1"));
        assert_eq!(manifest.elements["0"].len(), 2);
        assert_eq!(manifest.collisions["0"][0].name, "head");
    }

    #[test]
    fn test_parse_surface_header_range() {
        let targets = parse_surface_header("surface0,1,3-5").unwrap();
        assert_eq!(targets, vec!["0", "1", "3", "4", "5"]);
    }

    #[test]
    fn test_parse_collisionex() {
        let input = r#"
surface0
collisionex0,head,rect,10,10,50,50
collisionex1,bust,circle,100,100,25
collisionex2,leg,polygon,0,0,10,0,10,20
"#;
        let manifest = parse_surfaces_txt(input);
        assert_eq!(manifest.collisions["0"].len(), 3);
        assert_eq!(manifest.collisions["0"][0].name, "head");
        assert_eq!(manifest.collisions["0"][1].name, "bust");
        assert_eq!(manifest.collisions["0"][2].name, "leg");
    }
}
