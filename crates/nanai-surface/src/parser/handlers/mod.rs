//! `surface[N]` ブロック内の個別キー処理（collision / element / animation / point）モジュール

mod animation;
mod collision;
mod element;
mod point;
mod utils;

use crate::types::SurfacesTxt;
use animation::{Apply_animation_lineParams, apply_animation_line};
use collision::{
    Apply_collisionParams, Apply_collisionexParams, apply_collision, apply_collisionex,
};
use element::{Apply_elementParams, apply_element};
use point::{Apply_pointParams, apply_point};
pub use utils::expand_range;
use utils::{first_i32, parse_balloon_offset_key};

/// `surface[N] {}` / `surface.append[N] {}` ブロック内のキー・バリューを適用する
pub(in crate::parser) fn apply_surface_key(
    txt: &mut SurfacesTxt,
    ids: &[u32],
    key: &str,
    value: &str,
) {
    let key_lower = key.to_lowercase();

    if let Some(rest) = key_lower.strip_prefix("collisionex") {
        apply_collisionex(Apply_collisionexParams {
            txt,
            ids,
            id_part: rest,
            value,
        });
    } else if let Some(rest) = key_lower.strip_prefix("collision") {
        apply_collision(Apply_collisionParams {
            txt,
            ids,
            id_part: rest,
            value,
        });
    } else if let Some(rest) = key_lower.strip_prefix("element") {
        apply_element(Apply_elementParams {
            txt,
            ids,
            id_part: rest,
            value,
        });
    } else if let Some(rest) = key_lower.strip_prefix("animation") {
        apply_animation_line(Apply_animation_lineParams {
            txt,
            ids,
            rest,
            value,
        });
    } else if key_lower == "name" {
        for id in ids {
            txt.surfaces.entry(*id).or_default().name = Some(value.trim().to_string());
        }
    } else if key_lower == "icon.rect" {
        let coords: Vec<i32> = value
            .split(',')
            .filter_map(|t| t.trim().parse::<i32>().ok())
            .collect();
        if coords.len() >= 4 {
            let rect = [coords[0], coords[1], coords[2], coords[3]];
            for id in ids {
                txt.surfaces.entry(*id).or_default().icon_rect = Some(rect);
            }
        }
    } else if let Some(rest) = key_lower.strip_prefix("point.") {
        apply_point(Apply_pointParams {
            txt,
            ids,
            field: rest,
            value,
        });
    } else if let Some(offset) = parse_balloon_offset_key(&key_lower) {
        for id in ids {
            let def = txt.surfaces.entry(*id).or_default();
            let entry = def.balloon_offsets.entry(offset.0.clone()).or_default();
            if offset.1 == 'x' {
                entry.x = first_i32(value);
            } else {
                entry.y = first_i32(value);
            }
        }
    } else {
        for id in ids {
            txt.surfaces
                .entry(*id)
                .or_default()
                .properties
                .insert(key.to_string(), value.trim().to_string());
        }
    }
}

#[cfg(test)]
mod tests;
