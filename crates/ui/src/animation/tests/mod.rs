mod timeline;
mod coverage;
mod scheduler;

use super::*;
use crate::surfaces::{AnimationPattern, DrawMethod, Interval, SurfacesTxt};

pub(crate) fn pattern(index: u32, surface: i32, wait: u32) -> AnimationPattern {
    AnimationPattern {
        index,
        method: DrawMethod::Overlay,
        surface,
        wait,
        wait_max: None,
        x: 0,
        y: 0,
        options: vec![],
    }
}
