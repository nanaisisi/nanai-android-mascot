//! サーフィス定義およびアニメーション出力データ型定義

use crate::surface_collision::CollisionArea;
use crate::surface_compositor::SurfaceElement;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use tsify::Tsify;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct AnimationPatternOutput {
    pub surface: String,
    pub wait: u32,
    #[serde(rename = "type")]
    pub pattern_type: String,
    pub x: i32,
    pub y: i32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub target_param: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct AnimationOutput {
    pub id: u32,
    pub interval: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub options: Option<Vec<String>>,
    pub patterns: Vec<AnimationPatternOutput>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct ParsedSurfacesManifest {
    pub elements: BTreeMap<String, Vec<SurfaceElement>>,
    pub collisions: BTreeMap<String, Vec<CollisionArea>>,
    pub animations: BTreeMap<String, Vec<AnimationOutput>>,
    pub collision_sort: String,
    pub animation_sort: String,
}
