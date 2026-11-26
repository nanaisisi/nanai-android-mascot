#[cfg(any(desktop, test))]
pub(super) fn sanitize_scale(scale: f64) -> f64 {
    if scale > 0.0 && scale.is_finite() {
        scale
    } else {
        1.0
    }
}

#[cfg(any(desktop, test))]
pub(super) fn work_area_to_logical(
    pos_x: i32,
    pos_y: i32,
    width: u32,
    height: u32,
    scale: f64,
) -> (f64, f64, f64, f64, f64) {
    let safe_scale = sanitize_scale(scale);
    let work_x = (pos_x as f64) / safe_scale;
    let work_y = (pos_y as f64) / safe_scale;
    let work_w = (width as f64) / safe_scale;
    let work_h = (height as f64) / safe_scale;
    (safe_scale, work_x, work_y, work_w, work_h)
}

#[cfg(desktop)]
pub(super) fn monitor_logical_work_area(monitor: &tauri::Monitor) -> (f64, f64, f64, f64, f64) {
    let work = monitor.work_area();
    work_area_to_logical(
        work.position.x,
        work.position.y,
        work.size.width,
        work.size.height,
        monitor.scale_factor(),
    )
}

#[cfg(any(desktop, test))]
pub(super) fn compute_default_character_position(
    scope_id: i32,
    eff_w: f64,
    eff_h: f64,
    work_x: f64,
    work_y: f64,
    work_w: f64,
    work_h: f64,
) -> (f64, f64) {
    let raw_x = if scope_id == 0 {
        work_x + work_w - eff_w - 80.0
    } else {
        work_x + work_w - eff_w - 320.0 - (scope_id as f64 * 220.0)
    };
    let raw_y = work_y + work_h - eff_h;

    let max_x = (work_x + work_w - eff_w).max(work_x);
    let max_y = (work_y + work_h - eff_h).max(work_y);
    (raw_x.clamp(work_x, max_x), raw_y.clamp(work_y, max_y))
}
