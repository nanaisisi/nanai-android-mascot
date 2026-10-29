//! 描画要素 (`element`) ハンドラー

use crate::surfaces::types::*;
use super::utils::split_id_suffix;

pub(super) fn apply_element(txt: &mut SurfacesTxt, ids: &[u32], id_part: &str, value: &str) {
    let (_word, id) = split_id_suffix(id_part);
    let tokens: Vec<String> = value.split(',').map(|t| t.trim().to_string()).collect();
    if tokens.len() < 3 {
        return;
    }
    let element = ElementDef {
        id: id.unwrap_or(0),
        method: DrawMethod::parse(&tokens[0]),
        file: tokens[1].clone(),
        x: tokens.get(2).and_then(|t| t.parse().ok()).unwrap_or(0),
        y: tokens.get(3).and_then(|t| t.parse().ok()).unwrap_or(0),
        options: tokens.iter().skip(4).cloned().collect(),
    };
    for num in ids {
        txt.surfaces
            .entry(*num)
            .or_default()
            .elements
            .push(element.clone());
    }
}
