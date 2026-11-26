#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize)]
#[serde(default)]
pub struct SetBalloonOffsetParams {
    #[serde(alias = "scopeId")]
    scope_id: Option<i32>,
    x: Option<i32>,
    y: Option<i32>,
}

impl SetBalloonOffsetParams {
    pub fn scope_id(&self) -> Option<i32> {
        self.scope_id
    }

    pub fn x(&self) -> Option<i32> {
        self.x
    }

    pub fn y(&self) -> Option<i32> {
        self.y
    }
}

pub(super) fn safe_scale_factor(scale: f64) -> f64 {
    if scale > 0.0 && scale.is_finite() {
        scale
    } else {
        1.0
    }
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct PhysicalWorkArea {
    pub x: i32,
    pub y: i32,
    pub width: i32,
    pub height: i32,
    pub mon_x: i32,
    pub mon_y: i32,
    pub mon_width: i32,
    pub mon_height: i32,
    pub scale_factor: f64,
}

impl PhysicalWorkArea {
    #[allow(clippy::too_many_arguments)]
    pub fn from_rects(
        work_x: i32,
        work_y: i32,
        work_w: i32,
        work_h: i32,
        mon_x: i32,
        mon_y: i32,
        mon_w: i32,
        mon_h: i32,
        scale_factor: f64,
    ) -> Self {
        Self {
            x: work_x,
            y: work_y,
            width: work_w,
            height: work_h,
            mon_x,
            mon_y,
            mon_width: mon_w,
            mon_height: mon_h,
            scale_factor: safe_scale_factor(scale_factor),
        }
    }

    pub fn from_monitor(monitor: &tauri::Monitor) -> Self {
        let work = monitor.work_area();
        let pos = monitor.position();
        let size = monitor.size();
        Self::from_rects(
            work.position.x,
            work.position.y,
            work.size.width as i32,
            work.size.height as i32,
            pos.x,
            pos.y,
            size.width as i32,
            size.height as i32,
            monitor.scale_factor(),
        )
    }
}
