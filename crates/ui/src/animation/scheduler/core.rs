//! SERIKO アニメーションスケジューラ (Slot-08 外部インターフェース規約)

use super::active::ActiveAnimation;
use std::collections::{HashMap, HashSet};

#[path = "state.rs"]
mod state;
#[path = "stepping.rs"]
mod stepping;
#[path = "triggers.rs"]
mod triggers;

/// SERIKO アニメーションスケジューラ (Slot-08 外部インターフェース規約)
#[derive(Debug, Default, Clone)]
pub struct AnimationScheduler {
    /// scope_id -> active animations list
    pub(crate) active_animations: HashMap<u32, Vec<ActiveAnimation>>,
    /// scope_id -> paused animation IDs
    pub(crate) paused_animations: HashMap<u32, HashSet<u32>>,
    /// scope_id -> active bind IDs
    pub(crate) active_binds: HashMap<u32, HashSet<u32>>,
    /// scope_id -> current surface ID
    pub(crate) current_surfaces: HashMap<u32, i32>,
    /// 発話文字数カウンタ (scope_id -> count)
    pub(crate) spoken_counts: HashMap<u32, u32>,
    /// 発話中フラグ (scope_id -> bool)
    pub(crate) talking_flags: HashMap<u32, bool>,
    /// 動的アニメーション座標オフセット (scope_id -> (anim_id -> (offset_x, offset_y)))
    pub(crate) animation_offsets: HashMap<u32, HashMap<u32, (i32, i32)>>,
}

impl AnimationScheduler {
    pub fn new() -> Self {
        Self::default()
    }
}
