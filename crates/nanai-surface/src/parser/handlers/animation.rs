//! アニメーション (`animation`) ハンドラー

use crate::types::*;

#[allow(non_camel_case_types)]
pub(in crate::parser) struct Apply_animation_lineParams<'a> {
    pub(crate) txt: &'a mut SurfacesTxt,
    pub(crate) ids: &'a [u32],
    pub(crate) rest: &'a str,
    pub(crate) value: &'a str,
}

#[allow(dead_code)]
impl<'a> Apply_animation_lineParams<'a> {
    // Add getter methods
    pub fn txt(&mut self) -> &mut SurfacesTxt {
        self.txt
    }
    pub fn ids(&self) -> &'a [u32] {
        self.ids
    }
    pub fn rest(&self) -> &'a str {
        self.rest
    }
    pub fn value(&self) -> &'a str {
        self.value
    }
}

pub(crate) fn apply_animation_line(mut params: Apply_animation_lineParams<'_>) {
    let rest = params.rest().to_string();
    let value = params.value().to_string();
    let ids = params.ids().to_vec();

    let Some((id_part, field)) = rest.split_once('.') else {
        return;
    };
    let Ok(id) = id_part.trim().parse::<u32>() else {
        return;
    };
    let field = field.trim().to_string();
    let field_lower = field.to_lowercase();

    let txt = params.txt();

    for num in &ids {
        let def = txt.surfaces.entry(*num).or_default();
        let anim = def.animations.entry(id).or_default();
        anim.id = id;

        if field_lower == "interval" {
            anim.interval = Some(Interval::parse(&value));
        } else if field_lower.starts_with("name") {
            anim.name = Some(value.trim().to_string());
        } else if field_lower.starts_with("option") {
            let tokens: Vec<String> = value
                .split(',')
                .map(|s| s.trim().to_string())
                .filter(|s| !s.is_empty())
                .collect();
            if !tokens.is_empty() {
                anim.options.push(tokens);
            }
        } else if let Some(pat_str) = field_lower.strip_prefix("pattern") {
            let pat_index = if pat_str.is_empty() {
                anim.patterns.len() as u32
            } else {
                pat_str.parse::<u32>().unwrap_or(0)
            };

            let parts: Vec<&str> = value.split(',').map(|s| s.trim()).collect();
            if parts.is_empty() {
                continue;
            }

            let method = DrawMethod::parse(parts[0]);
            let surface = parts
                .get(1)
                .and_then(|s| s.parse::<i32>().ok())
                .unwrap_or(0);
            let (wait, wait_max) = parts.get(2).map(|s| parse_wait(s)).unwrap_or((0, None));

            let x = parts
                .get(3)
                .and_then(|s| s.parse::<i32>().ok())
                .unwrap_or(0);
            let y = parts
                .get(4)
                .and_then(|s| s.parse::<i32>().ok())
                .unwrap_or(0);

            let mut options = Vec::new();
            for opt_part in parts.iter().skip(5) {
                if !opt_part.is_empty() {
                    options.push(opt_part.to_string());
                }
            }

            let pattern =
                AnimationPattern::new(pat_index, method, surface, wait, wait_max, x, y, options);

            anim.patterns.push(pattern);
            anim.patterns.sort_by_key(|p| p.index);
        }
    }
}

fn parse_wait(s: &str) -> (u32, Option<u32>) {
    if let Some((min_s, max_s)) = s.split_once('-') {
        let min = min_s.trim().parse::<u32>().unwrap_or(0);
        let max = max_s.trim().parse::<u32>().unwrap_or(min);
        (min, Some(max))
    } else {
        let val = s.trim().parse::<u32>().unwrap_or(0);
        (val, None)
    }
}
