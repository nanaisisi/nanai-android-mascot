//! 描画要素 (`element`) ハンドラー

use super::utils::split_id_suffix;
use crate::types::*;

#[allow(non_camel_case_types)]
pub(in crate::parser) struct Apply_elementParams<'a> {
    pub(crate) txt: &'a mut SurfacesTxt,
    pub(crate) ids: &'a [u32],
    pub(crate) id_part: &'a str,
    pub(crate) value: &'a str,
}

#[allow(dead_code)]
impl<'a> Apply_elementParams<'a> {
    // Add getter methods
    pub fn txt(&mut self) -> &mut SurfacesTxt {
        self.txt
    }
    pub fn ids(&self) -> &'a [u32] {
        self.ids
    }
    pub fn id_part(&self) -> &'a str {
        self.id_part
    }
    pub fn value(&self) -> &'a str {
        self.value
    }
}

pub(crate) fn apply_element(mut params: Apply_elementParams<'_>) {
    let id_part = params.id_part().to_string();
    let value = params.value().to_string();
    let ids = params.ids().to_vec();

    let (_word, id) = split_id_suffix(&id_part);
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
    let txt = params.txt();
    for num in &ids {
        txt.surfaces
            .entry(*num)
            .or_default()
            .elements
            .push(element.clone());
    }
}
