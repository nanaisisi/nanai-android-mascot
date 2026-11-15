//! `surfaces.txt` メイン構造化パース処理

use super::animations::parse_animation_line;
use super::collisions::parse_collision_line;
use super::elements::parse_element_line;
use super::header::parse_surface_header;
use crate::surface_collision::CollisionArea;
use crate::surface_compositor::SurfaceElement;
use crate::surfaces_parser::types::{AnimationOutput, ParsedSurfacesManifest};
use std::collections::BTreeMap;

/// `surfaces.txt` のテキスト文字列を高速に構造化パース
pub fn parse_surfaces_txt(text: &str) -> ParsedSurfacesManifest {
    let mut elements: BTreeMap<String, Vec<SurfaceElement>> = BTreeMap::new();
    let mut collisions: BTreeMap<String, Vec<CollisionArea>> = BTreeMap::new();
    let mut animations: BTreeMap<String, Vec<AnimationOutput>> = BTreeMap::new();
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

        let lower_trimmed = trimmed.to_ascii_lowercase();

        // アニメーション行のパース
        if lower_trimmed.starts_with("animation")
            || (lower_trimmed
                .chars()
                .next()
                .is_some_and(|c| c.is_ascii_digit())
                && (lower_trimmed.contains("interval")
                    || lower_trimmed.contains("pattern")
                    || lower_trimmed.contains("name")
                    || lower_trimmed.contains("option")))
        {
            parse_animation_line(trimmed, &current_surfaces, &mut animations);
            continue;
        }

        // elementN,method,file,x,y 行のパース
        if lower_trimmed.starts_with("element") {
            parse_element_line(trimmed, &current_surfaces, &mut elements);
            continue;
        }

        // collisionN / collisionexN 行のパース
        if lower_trimmed.starts_with("collision") {
            parse_collision_line(trimmed, &current_surfaces, &mut collisions);
            continue;
        }
    }

    ParsedSurfacesManifest {
        elements,
        collisions,
        animations,
        collision_sort,
        animation_sort,
    }
}
