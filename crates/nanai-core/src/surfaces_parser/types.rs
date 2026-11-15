//! サーフィス定義およびアニメーション出力データ型定義

use crate::surface_collision::CollisionArea;
use crate::surface_compositor::SurfaceElement;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use tsify::Tsify;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct AnimationPatternOutput {
    pub(crate) surface: String,
    pub(crate) wait: u32,
    #[serde(rename = "type")]
    pub(crate) pattern_type: String,
    pub(crate) x: i32,
    pub(crate) y: i32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) target_param: Option<String>,
}

impl AnimationPatternOutput {
    pub fn surface(&self) -> &str {
        &self.surface
    }

    pub fn wait(&self) -> u32 {
        self.wait
    }

    pub fn pattern_type(&self) -> &str {
        &self.pattern_type
    }

    pub fn x(&self) -> i32 {
        self.x
    }

    pub fn y(&self) -> i32 {
        self.y
    }

    pub fn target_param(&self) -> Option<&str> {
        self.target_param.as_deref()
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct AnimationOutput {
    pub(crate) id: u32,
    pub(crate) interval: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) options: Option<Vec<String>>,
    pub(crate) patterns: Vec<AnimationPatternOutput>,
}

impl AnimationOutput {
    pub fn id(&self) -> u32 {
        self.id
    }

    pub fn interval(&self) -> &str {
        &self.interval
    }

    pub fn name(&self) -> Option<&str> {
        self.name.as_deref()
    }

    pub fn options(&self) -> Option<&[String]> {
        self.options.as_deref()
    }

    pub fn patterns(&self) -> &[AnimationPatternOutput] {
        &self.patterns
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct ParsedSurfacesManifest {
    pub(crate) elements: BTreeMap<String, Vec<SurfaceElement>>,
    pub(crate) collisions: BTreeMap<String, Vec<CollisionArea>>,
    pub(crate) animations: BTreeMap<String, Vec<AnimationOutput>>,
    pub(crate) collision_sort: String,
    pub(crate) animation_sort: String,
}

impl ParsedSurfacesManifest {
    pub fn elements(&self) -> &BTreeMap<String, Vec<SurfaceElement>> {
        &self.elements
    }

    pub fn collisions(&self) -> &BTreeMap<String, Vec<CollisionArea>> {
        &self.collisions
    }

    pub fn animations(&self) -> &BTreeMap<String, Vec<AnimationOutput>> {
        &self.animations
    }

    pub fn collision_sort(&self) -> &str {
        &self.collision_sort
    }

    pub fn animation_sort(&self) -> &str {
        &self.animation_sort
    }
}
