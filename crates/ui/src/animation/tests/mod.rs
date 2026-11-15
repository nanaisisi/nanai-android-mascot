mod active_animation;
mod options_parsing;
mod scheduler;
mod scheduler_stepping;
mod timeline;
mod triggers_events;

use super::*;
use nanai_surface::{AnimationPattern, DrawMethod, Interval, SurfacesTxt};

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
    AnimationPattern::new(
        params.index,
        DrawMethod::Overlay,
        params.surface,
        params.wait,
        None,
        0,
        0,
        vec![],
    )
}
