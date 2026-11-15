//! 描画要素 (`element`) ハンドラー

use super::utils::split_id_suffix;
use crate::types::*;

#[allow(non_camel_case_types)]
pub struct Apply_elementParams<'a> {
    pub txt: &'a mut SurfacesTxt,
    pub ids: &'a [u32],
    pub id_part: &'a str,
    pub value: &'a str,
}

pub(crate) fn apply_element(params: Apply_elementParams<'_>) {
    let txt = params.txt;
    let ids = params.ids;
    let id_part = params.id_part;
    let value = params.value;

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
