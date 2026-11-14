mod active_animation;
mod options_parsing;
mod scheduler;
mod scheduler_stepping;
mod timeline;
mod triggers_events;

use super::*;
use crate::surfaces_core_core::{DrawMethod, Interval};
use crate::surfaces_core_integration::{AnimationPattern, SurfacesTxt};

pub(crate) struct PatternParams {
    pub index: u32,
    pub surface: i32,
    pub wait: u32,
}

impl PatternParams {
    pub const fn new(index: u32, surface: i32, wait: u32) -> Self {
        Self {
            index,
            surface,
            wait,
        }
    }
}

impl From<(u32, i32, u32)> for PatternParams {
    fn from(t: (u32, i32, u32)) -> Self {
        Self {
            index: t.0,
            surface: t.1,
            wait: t.2,
        }
    }
}

pub(crate) fn pattern(params: PatternParams) -> AnimationPattern {
    AnimationPattern {
        index: params.index,
        method: DrawMethod::Overlay,
        surface: params.surface,
        wait: params.wait,
        wait_max: None,
        x: 0,
        y: 0,
        options: vec![],
    }
}
