use std::sync::{LazyLock, Mutex};
use tauri::Emitter;

static BALLOON_CREATION_LOCKS: LazyLock<Mutex<std::collections::HashSet<i32>>> =
    LazyLock::new(|| Mutex::new(std::collections::HashSet::new()));

struct BalloonLockGuard(i32);
impl Drop for BalloonLockGuard {
    fn drop(&mut self) {
        if let Ok(mut locks) = BALLOON_CREATION_LOCKS.lock() {
            locks.remove(&self.0);
        }
    }
}

#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize)]
#[serde(default)]
pub struct ShowBalloonWindowParams {
    #[serde(alias = "scopeId")]
    pub scope_id: Option<i32>,
    pub theme: Option<String>,
    pub x: Option<f64>,
    pub y: Option<f64>,
    pub width: Option<f64>,
    pub height: Option<f64>,
}

#[cfg(any(desktop, test))]
#[allow(clippy::too_many_arguments)]
fn resolve_show_balloon_args(
    params: Option<ShowBalloonWindowParams>,
    scope_id: Option<i32>,
    scope_id_camel: Option<i32>,
    theme: Option<String>,
    x: Option<f64>,
    y: Option<f64>,
    width: Option<f64>,
    height: Option<f64>,
) -> (
    i32,
    Option<String>,
    Option<f64>,
    Option<f64>,
    Option<f64>,
    Option<f64>,
) {
    let resolved_params = params.unwrap_or_default();
    let s_id = resolved_params
        .scope_id
        .or(scope_id)
        .or(scope_id_camel)
        .unwrap_or(0);
    let t_val = resolved_params.theme.or(theme);
    let p_x = resolved_params.x.or(x);
    let p_y = resolved_params.y.or(y);
    let w_val = resolved_params.width.or(width);
    let h_val = resolved_params.height.or(height);
    (s_id, t_val, p_x, p_y, w_val, h_val)
}

#[cfg(any(desktop, test))]
#[derive(Debug, Clone, Copy, PartialEq)]
struct LogicalWorkArea {
    x: f64,
    y: f64,
    width: f64,
    height: f64,
    mon_x: f64,
    mon_y: f64,
    mon_width: f64,
    mon_height: f64,
    scale_factor: f64,
}

#[cfg(any(desktop, test))]
impl LogicalWorkArea {
    #[allow(clippy::too_many_arguments)]
    fn from_physical_rects(
        work_x: i32,
        work_y: i32,
        work_w: u32,
        work_h: u32,
        mon_x: i32,
        mon_y: i32,
        mon_w: u32,
        mon_h: u32,
        scale_factor: f64,
    ) -> Self {
        let safe_scale = safe_scale_factor(scale_factor);
        Self {
            x: work_x as f64 / safe_scale,
            y: work_y as f64 / safe_scale,
            width: work_w as f64 / safe_scale,
            height: work_h as f64 / safe_scale,
            mon_x: mon_x as f64 / safe_scale,
            mon_y: mon_y as f64 / safe_scale,
            mon_width: mon_w as f64 / safe_scale,
            mon_height: mon_h as f64 / safe_scale,
            scale_factor: safe_scale,
        }
    }

    fn default_fallback() -> Self {
        Self {
            x: 0.0,
            y: 0.0,
            width: 1920.0,
            height: 1080.0,
            mon_x: 0.0,
            mon_y: 0.0,
            mon_width: 1920.0,
            mon_height: 1080.0,
            scale_factor: 1.0,
        }
    }
}

#[cfg(any(desktop, test))]
fn safe_scale_factor(scale: f64) -> f64 {
    if scale > 0.0 && scale.is_finite() {
        scale
    } else {
        1.0
    }
}

/// バルーンの論理座標をクランプする（X軸は無制限、Y軸のみタスクバー除外ワークスペース内に絶対クランプ）
#[cfg(any(desktop, test))]
fn clamp_logical_position_y_only(
    x: f64,
    y: f64,
    height: f64,
    work_y: f64,
    work_h: f64,
) -> (f64, f64) {
    let clamped_y = if !y.is_finite() || !height.is_finite() || work_h <= 0.0 || height >= work_h {
        work_y
    } else {
        let max_y = (work_y + work_h - height).max(work_y);
        y.clamp(work_y, max_y)
    };
    (x, clamped_y)
}

#[cfg(any(desktop, test))]
fn needs_vertical_clamp(y: f64, height: f64, work_y: f64, work_h: f64) -> bool {
    if !y.is_finite() {
        return true;
    }
    let (_, clamped_y) = clamp_logical_position_y_only(0.0, y, height, work_y, work_h);
    (clamped_y - y).abs() > 1e-6
}

#[cfg(any(desktop, test))]
fn select_best_rect_index(rects: &[(f64, f64, f64, f64)], x: f64, y: f64) -> Option<usize> {
    if rects.is_empty() {
        return None;
    }
    if let Some((idx, _)) = rects
        .iter()
        .enumerate()
        .find(|(_, (rx, ry, rw, rh))| x >= *rx && x < *rx + *rw && y >= *ry && y < *ry + *rh)
    {
        return Some(idx);
    }
    rects
        .iter()
        .enumerate()
        .min_by(|(_, a), (_, b)| {
            let dist = |(rx, ry, rw, rh): &(f64, f64, f64, f64)| -> (f64, f64) {
                let dx = if x < *rx {
                    *rx - x
                } else if x > *rx + *rw {
                    x - (*rx + *rw)
                } else {
                    0.0
                };
                let dy = if y < *ry {
                    *ry - y
                } else if y > *ry + *rh {
                    y - (*ry + *rh)
                } else {
                    0.0
                };
                (dx, dy)
            };
            dist(a)
                .partial_cmp(&dist(b))
                .unwrap_or(std::cmp::Ordering::Equal)
        })
        .map(|(idx, _)| idx)
}

#[cfg(desktop)]
fn monitor_logical_work_area(monitor: &tauri::Monitor) -> LogicalWorkArea {
    let work = monitor.work_area();
    let pos = monitor.position();
    let size = monitor.size();
    LogicalWorkArea::from_physical_rects(
        work.position.x,
        work.position.y,
        work.size.width,
        work.size.height,
        pos.x,
        pos.y,
        size.width,
        size.height,
        monitor.scale_factor(),
    )
}

#[cfg(desktop)]
fn window_scale_factor(win: &tauri::WebviewWindow, fallback: f64) -> f64 {
    win.scale_factor()
        .ok()
        .filter(|s| *s > 0.0 && s.is_finite())
        .or_else(|| {
            win.current_monitor()
                .ok()
                .flatten()
                .map(|m| m.scale_factor())
                .filter(|s| *s > 0.0 && s.is_finite())
        })
        .unwrap_or_else(|| safe_scale_factor(fallback))
}

#[cfg(desktop)]
fn select_monitor_for_physical_point(
    app_handle: &tauri::AppHandle,
    px: f64,
    py: f64,
) -> Option<tauri::Monitor> {
    let monitors = app_handle.available_monitors().ok()?;
    let rects: Vec<(f64, f64, f64, f64)> = monitors
        .iter()
        .map(|m| {
            let p = m.position();
            let s = m.size();
            (p.x as f64, p.y as f64, s.width as f64, s.height as f64)
        })
        .collect();
    select_best_rect_index(&rects, px, py).and_then(|idx| monitors.into_iter().nth(idx))
}

#[cfg(desktop)]
fn select_monitor_for_logical_point(
    app_handle: &tauri::AppHandle,
    lx: f64,
    ly: f64,
) -> Option<tauri::Monitor> {
    let monitors = app_handle.available_monitors().ok()?;
    let rects: Vec<(f64, f64, f64, f64)> = monitors
        .iter()
        .map(|m| {
            let area = monitor_logical_work_area(m);
            (area.mon_x, area.mon_y, area.mon_width, area.mon_height)
        })
        .collect();
    select_best_rect_index(&rects, lx, ly).and_then(|idx| monitors.into_iter().nth(idx))
}

#[cfg(desktop)]
fn monitor_from_window_center(
    app_handle: &tauri::AppHandle,
    win: &tauri::WebviewWindow,
) -> Option<tauri::Monitor> {
    win.current_monitor().ok().flatten().or_else(|| {
        let pos = win.outer_position().ok()?;
        let size = win.outer_size().ok()?;
        let cx = pos.x as f64 + (size.width as f64) / 2.0;
        let cy = pos.y as f64 + (size.height as f64) / 2.0;
        select_monitor_for_physical_point(app_handle, cx, cy)
    })
}

#[cfg(any(desktop, test))]
fn compute_default_logical_balloon_pos(
    scope_id: i32,
    char_x: f64,
    char_y: f64,
    char_width: f64,
    balloon_width: f64,
    work_x: f64,
    work_w: f64,
) -> (f64, f64) {
    let raw_x = if scope_id == 0 {
        let overflows_right = char_x + char_width - 10.0 + balloon_width > work_x + work_w;
        if overflows_right {
            char_x - balloon_width + 10.0
        } else {
            char_x + char_width - 20.0
        }
    } else {
        char_x - balloon_width + 20.0
    };
    (raw_x, char_y - 20.0)
}

#[cfg(desktop)]
fn restore_menu_focus_if_visible(app_handle: &tauri::AppHandle) {
    use tauri::Manager;
    if let Some(menu_win) = app_handle.get_webview_window("menu_window")
        && menu_win.is_visible().unwrap_or(false)
    {
        let _ = menu_win.set_focus();
    }
}

/// 独立バルーン（スコープ N）ウィンドウ表示コマンド
#[tauri::command(rename_all = "snake_case")]
#[allow(non_snake_case)]
#[cfg_attr(not(desktop), allow(unused_variables))]
#[allow(clippy::too_many_arguments)]
pub async fn show_balloon_window(
    app_handle: tauri::AppHandle,
    params: Option<ShowBalloonWindowParams>,
    scope_id: Option<i32>,
    scopeId: Option<i32>,
    theme: Option<String>,
    x: Option<f64>,
    y: Option<f64>,
    width: Option<f64>,
    height: Option<f64>,
) -> Result<(), String> {
    #[cfg(desktop)]
    {
        let (s_id, t_val, p_x, p_y, w_val, h_val) =
            resolve_show_balloon_args(params, scope_id, scopeId, theme, x, y, width, height);

        println!("💬 show_balloon_window called: scope_id={}", s_id);
        use tauri::Manager;
        let label = format!("balloon_window_{}", s_id);

        if app_handle.get_webview_window(&label).is_none() {
            let mut locks = BALLOON_CREATION_LOCKS.lock().map_err(|e| e.to_string())?;
            if locks.contains(&s_id) {
                println!(
                    "⚠️ show_balloon_window creation already in progress for scope {}, skipping duplicate request.",
                    s_id
                );
                return Ok(());
            }
            locks.insert(s_id);
        }
        let _guard = BalloonLockGuard(s_id);

        let win_width = w_val.unwrap_or(280.0);
        let win_height = h_val.unwrap_or(200.0);

        let char_label = format!("subchar_window_{}", s_id);
        let char_win = app_handle.get_webview_window(&char_label);
        let existing_balloon = app_handle.get_webview_window(&label);

        let fallback_monitor = char_win
            .as_ref()
            .and_then(|w| monitor_from_window_center(&app_handle, w))
            .or_else(|| {
                existing_balloon
                    .as_ref()
                    .and_then(|w| monitor_from_window_center(&app_handle, w))
            })
            .or_else(|| app_handle.primary_monitor().ok().flatten());
        let fallback_work_area = fallback_monitor
            .as_ref()
            .map(monitor_logical_work_area)
            .unwrap_or_else(LogicalWorkArea::default_fallback);

        let balloon_scale = existing_balloon
            .as_ref()
            .map(|w| window_scale_factor(w, fallback_work_area.scale_factor))
            .unwrap_or(fallback_work_area.scale_factor);
        let existing_logical_size = existing_balloon.as_ref().and_then(|w| {
            w.outer_size().ok().and_then(|sz| {
                if sz.width > 0 && sz.height > 0 {
                    Some((
                        sz.width as f64 / balloon_scale,
                        sz.height as f64 / balloon_scale,
                    ))
                } else {
                    None
                }
            })
        });
        let actual_w = w_val
            .or_else(|| existing_logical_size.map(|(w, _)| w))
            .unwrap_or(280.0);
        let actual_h = h_val
            .or_else(|| existing_logical_size.map(|(_, h)| h))
            .unwrap_or(200.0);

        let compute_clamped_pos = || -> (f64, f64, f64) {
            let saved_offset = if p_x.is_none() && p_y.is_none() {
                app_handle
                    .try_state::<crate::common::state::AppState>()
                    .and_then(|st| st.balloon_offsets.lock().get(&s_id).copied())
            } else {
                None
            };

            if let (Some((ox, oy)), Some(cw)) = (saved_offset, char_win.as_ref()) {
                if let Ok(char_pos) = cw.outer_position() {
                    let raw_phys_x = char_pos.x + ox;
                    let raw_phys_y = char_pos.y + oy;
                    let char_scale = window_scale_factor(cw, fallback_work_area.scale_factor);
                    let target_mon = select_monitor_for_physical_point(
                        &app_handle,
                        raw_phys_x as f64 + (actual_w * char_scale) / 2.0,
                        raw_phys_y as f64 + (actual_h * char_scale) / 2.0,
                    )
                    .or_else(|| monitor_from_window_center(&app_handle, cw))
                    .or_else(|| fallback_monitor.clone());
                    let work = target_mon
                        .as_ref()
                        .map(monitor_logical_work_area)
                        .unwrap_or(fallback_work_area);
                    let raw_lx = raw_phys_x as f64 / work.scale_factor;
                    let raw_ly = raw_phys_y as f64 / work.scale_factor;
                    let (cx, cy) = clamp_logical_position_y_only(
                        raw_lx,
                        raw_ly,
                        actual_h,
                        work.y,
                        work.height,
                    );
                    return (cx, cy, work.scale_factor);
                }
            }

            let (raw_x, raw_y) = if let (Some(px), Some(py)) = (p_x, p_y) {
                (px, py)
            } else {
                let (def_x, def_y) = if let Some(ref cw) = char_win {
                    if let Ok(pos) = cw.outer_position() {
                        let cw_mon = monitor_from_window_center(&app_handle, cw)
                            .or_else(|| fallback_monitor.clone());
                        let cw_work = cw_mon
                            .as_ref()
                            .map(monitor_logical_work_area)
                            .unwrap_or(fallback_work_area);
                        let char_scale = window_scale_factor(cw, cw_work.scale_factor);
                        let base_x = pos.x as f64 / char_scale;
                        let base_y = pos.y as f64 / char_scale;
                        let char_width = cw
                            .outer_size()
                            .ok()
                            .filter(|sz| sz.width > 0)
                            .map(|sz| sz.width as f64 / char_scale)
                            .unwrap_or(200.0);

                        compute_default_logical_balloon_pos(
                            s_id,
                            base_x,
                            base_y,
                            char_width,
                            actual_w,
                            cw_work.x,
                            cw_work.width,
                        )
                    } else {
                        (
                            fallback_work_area.x + 200.0 + (s_id as f64 * 220.0),
                            fallback_work_area.y + 100.0,
                        )
                    }
                } else {
                    (
                        fallback_work_area.x + 200.0 + (s_id as f64 * 220.0),
                        fallback_work_area.y + 100.0,
                    )
                };
                (p_x.unwrap_or(def_x), p_y.unwrap_or(def_y))
            };

            let target_mon = select_monitor_for_logical_point(
                &app_handle,
                raw_x + actual_w / 2.0,
                raw_y + actual_h / 2.0,
            )
            .or_else(|| fallback_monitor.clone());
            let work = target_mon
                .as_ref()
                .map(monitor_logical_work_area)
                .unwrap_or(fallback_work_area);
            let (cx, cy) =
                clamp_logical_position_y_only(raw_x, raw_y, actual_h, work.y, work.height);
            (cx, cy, work.scale_factor)
        };

        if let Some(balloon_win) = existing_balloon {
            let is_visible = balloon_win.is_visible().unwrap_or(false);
            let (target_x, target_y, target_phys_pos) =
                if is_visible && p_x.is_none() && p_y.is_none() {
                    if let Ok(pos) = balloon_win.outer_position() {
                        let win_mon = monitor_from_window_center(&app_handle, &balloon_win)
                            .or_else(|| fallback_monitor.clone());
                        let work = win_mon
                            .as_ref()
                            .map(monitor_logical_work_area)
                            .unwrap_or(fallback_work_area);
                        let win_scale = window_scale_factor(&balloon_win, work.scale_factor);
                        let cur_x = pos.x as f64 / win_scale;
                        let cur_y = pos.y as f64 / win_scale;
                        if needs_vertical_clamp(cur_y, actual_h, work.y, work.height) {
                            let (_, cy) = clamp_logical_position_y_only(
                                cur_x,
                                cur_y,
                                actual_h,
                                work.y,
                                work.height,
                            );
                            let clamped_phys_y = (cy * work.scale_factor).round() as i32;
                            (
                                cur_x,
                                cy,
                                Some(tauri::PhysicalPosition {
                                    x: pos.x,
                                    y: clamped_phys_y,
                                }),
                            )
                        } else {
                            (cur_x, cur_y, None)
                        }
                    } else {
                        let (cx, cy, scale) = compute_clamped_pos();
                        (
                            cx,
                            cy,
                            Some(tauri::PhysicalPosition {
                                x: (cx * scale).round() as i32,
                                y: (cy * scale).round() as i32,
                            }),
                        )
                    }
                } else {
                    let (cx, cy, scale) = compute_clamped_pos();
                    (
                        cx,
                        cy,
                        Some(tauri::PhysicalPosition {
                            x: (cx * scale).round() as i32,
                            y: (cy * scale).round() as i32,
                        }),
                    )
                };

            if let Some(phys_pos) = target_phys_pos {
                let _ = balloon_win.set_position(tauri::Position::Physical(phys_pos));
            }

            if !is_visible {
                let _ = balloon_win.unminimize();
                let _ = balloon_win.set_always_on_top(true);
                let _ = balloon_win.show();
                restore_menu_focus_if_visible(&app_handle);
            }
            println!(
                "✅ [Rust Window] 既存の balloon_window_{} を表示: x={}, y={}",
                s_id, target_x, target_y
            );

            if let Some(theme) = t_val.as_ref().filter(|value| !value.is_empty()) {
                let _ = app_handle.emit_to(
                    &label,
                    "balloon-theme-changed",
                    serde_json::json!({ "theme": theme }),
                );
            }
        } else {
            let (target_x, target_y, target_scale) = compute_clamped_pos();

            let title = format!("Nanai Mascot - Balloon {}", s_id);
            let theme_query = t_val
                .as_ref()
                .filter(|value| !value.is_empty())
                .map(|value| format!("&theme={value}"))
                .unwrap_or_default();
            let balloon_win = tauri::WebviewWindowBuilder::new(
                &app_handle,
                &label,
                tauri::WebviewUrl::App(format!("balloon.html?scope={s_id}{theme_query}").into()),
            )
            .title(title)
            .inner_size(win_width, win_height)
            .transparent(true)
            .decorations(false)
            .shadow(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .resizable(true)
            .position(target_x, target_y)
            .initialization_script(
                "(function(){var b=function(e){var t=e.target;var i=t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable);if(!i&&e.preventDefault){e.preventDefault();}};window.addEventListener('contextmenu',b,true);document.addEventListener('contextmenu',b,true);})();",
            )
            .build()
            .map_err(|e| {
                println!("❌ [Rust Window] balloon_window_{} 構築エラー: {}", s_id, e);
                e.to_string()
            })?;

            let _ = balloon_win.set_position(tauri::Position::Physical(tauri::PhysicalPosition {
                x: (target_x * target_scale).round() as i32,
                y: (target_y * target_scale).round() as i32,
            }));
            let _ = balloon_win.unminimize();
            let _ = balloon_win.set_always_on_top(true);
            let _ = balloon_win.show();
            restore_menu_focus_if_visible(&app_handle);
            println!(
                "🎉 [Rust Window] 新規 balloon_window_{} を構築・表示: x={}, y={}",
                s_id, target_x, target_y
            );

            if let Some(theme) = t_val.as_ref().filter(|value| !value.is_empty()) {
                let _ = app_handle.emit_to(
                    &label,
                    "balloon-theme-changed",
                    serde_json::json!({ "theme": theme }),
                );
            }
        }
    }
    Ok(())
}

#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize)]
#[serde(default)]
pub struct ResizeBalloonWindowParams {
    #[serde(alias = "scopeId")]
    scope_id: Option<i32>,
    width: Option<f64>,
    height: Option<f64>,
}

impl ResizeBalloonWindowParams {
    // Add getter methods
    #[allow(dead_code)]
    pub fn scope_id(&self) -> i32 {
        self.scope_id.unwrap_or(0)
    }

    #[allow(dead_code)]
    pub fn width(&self) -> f64 {
        self.width.unwrap_or(280.0)
    }

    #[allow(dead_code)]
    pub fn height(&self) -> f64 {
        self.height.unwrap_or(200.0)
    }
}

#[cfg(any(desktop, test))]
fn resolve_resize_balloon_args(
    params: Option<ResizeBalloonWindowParams>,
    scope_id: Option<i32>,
    scope_id_camel: Option<i32>,
    width: Option<f64>,
    height: Option<f64>,
) -> (i32, f64, f64) {
    let resolved_params = params.unwrap_or_default();
    let target_scope = resolved_params
        .scope_id
        .or(scope_id)
        .or(scope_id_camel)
        .unwrap_or(0);
    let target_width = resolved_params.width.or(width).unwrap_or(0.0);
    let target_height = resolved_params.height.or(height).unwrap_or(0.0);
    (target_scope, target_width, target_height)
}

/// バルーンウィンドウのサイズを画像実寸法に合せてリサイズするコマンド
#[tauri::command(rename_all = "snake_case")]
#[allow(non_snake_case)]
#[cfg_attr(not(desktop), allow(unused_variables))]
pub async fn resize_balloon_window(
    app_handle: tauri::AppHandle,
    params: Option<ResizeBalloonWindowParams>,
    scope_id: Option<i32>,
    scopeId: Option<i32>,
    width: Option<f64>,
    height: Option<f64>,
) -> Result<(), String> {
    #[cfg(desktop)]
    {
        let (target_scope, target_width, target_height) =
            resolve_resize_balloon_args(params, scope_id, scopeId, width, height);
        if target_width.is_finite()
            && target_height.is_finite()
            && target_width > 0.0
            && target_height > 0.0
        {
            use tauri::Manager;
            let label = format!("balloon_window_{}", target_scope);
            if let Some(balloon_win) = app_handle.get_webview_window(&label) {
                let _ = balloon_win.set_size(tauri::Size::Logical(tauri::LogicalSize {
                    width: target_width,
                    height: target_height,
                }));
                let char_label = format!("subchar_window_{}", target_scope);
                let monitor_opt = monitor_from_window_center(&app_handle, &balloon_win)
                    .or_else(|| {
                        app_handle
                            .get_webview_window(&char_label)
                            .and_then(|cw| monitor_from_window_center(&app_handle, &cw))
                    })
                    .or_else(|| app_handle.primary_monitor().ok().flatten());
                if let (Ok(pos), Some(monitor)) = (balloon_win.outer_position(), monitor_opt) {
                    let work = monitor_logical_work_area(&monitor);
                    let pos_y = pos.y as f64 / work.scale_factor;
                    if needs_vertical_clamp(pos_y, target_height, work.y, work.height) {
                        let (_, clamped_y) = clamp_logical_position_y_only(
                            pos.x as f64 / work.scale_factor,
                            pos_y,
                            target_height,
                            work.y,
                            work.height,
                        );
                        let clamped_phys_y = (clamped_y * work.scale_factor).round() as i32;
                        let _ = balloon_win.set_position(tauri::Position::Physical(
                            tauri::PhysicalPosition {
                                x: pos.x,
                                y: clamped_phys_y,
                            },
                        ));
                    }
                }
            }
        }
    }
    Ok(())
}

#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize)]
#[serde(default)]
pub struct HideBalloonWindowParams {
    #[serde(alias = "scopeId")]
    scope_id: Option<i32>,
}

impl HideBalloonWindowParams {
    #[allow(dead_code)]
    pub fn scope_id(&self) -> i32 {
        self.scope_id.unwrap_or(0)
    }
}

#[cfg(any(desktop, test))]
fn resolve_hide_balloon_scope(
    params: Option<HideBalloonWindowParams>,
    scope_id: Option<i32>,
    scope_id_camel: Option<i32>,
    scope_id_legacy: Option<i32>,
) -> i32 {
    params
        .and_then(|p| p.scope_id)
        .or(scope_id)
        .or(scope_id_camel)
        .or(scope_id_legacy)
        .unwrap_or(0)
}

/// 独立バルーン（スコープ N）ウィンドウ非表示コマンド (\b[-1])
#[tauri::command(rename_all = "snake_case")]
#[allow(non_snake_case)]
#[cfg_attr(not(desktop), allow(unused_variables))]
pub async fn hide_balloon_window(
    app_handle: tauri::AppHandle,
    params: Option<HideBalloonWindowParams>,
    scope_id: Option<i32>,
    scopeId: Option<i32>,
    _scope_id: Option<i32>,
) -> Result<(), String> {
    #[cfg(desktop)]
    {
        let target_scope = resolve_hide_balloon_scope(params, scope_id, scopeId, _scope_id);
        use tauri::Manager;
        let label = format!("balloon_window_{}", target_scope);
        if let Some(balloon_win) = app_handle.get_webview_window(&label) {
            let _ = balloon_win.hide();
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn resize_params_deserialize_camel_snake_and_defaults() {
        let camel: ResizeBalloonWindowParams =
            serde_json::from_str(r#"{"scopeId": 2, "width": 360.0, "height": 240.0}"#).unwrap();
        assert_eq!(camel.scope_id(), 2);
        assert_eq!(camel.width(), 360.0);
        assert_eq!(camel.height(), 240.0);

        let snake: ResizeBalloonWindowParams =
            serde_json::from_str(r#"{"scope_id": 1, "width": 320.0, "height": 210.0}"#).unwrap();
        assert_eq!(snake.scope_id(), 1);
        assert_eq!(snake.width(), 320.0);
        assert_eq!(snake.height(), 210.0);

        let empty: ResizeBalloonWindowParams = serde_json::from_str(r#"{}"#).unwrap();
        assert_eq!(empty.scope_id(), 0);
        assert_eq!(empty.width(), 280.0);
        assert_eq!(empty.height(), 200.0);
    }

    #[test]
    fn resolve_resize_args_supports_nested_flat_and_fallbacks() {
        let nested: ResizeBalloonWindowParams =
            serde_json::from_str(r#"{"scopeId": 1, "width": 410.0, "height": 290.0}"#).unwrap();
        assert_eq!(
            resolve_resize_balloon_args(Some(nested), Some(9), Some(8), Some(100.0), Some(100.0)),
            (1, 410.0, 290.0)
        );

        assert_eq!(
            resolve_resize_balloon_args(None, None, Some(2), Some(380.0), Some(260.0)),
            (2, 380.0, 260.0)
        );

        assert_eq!(
            resolve_resize_balloon_args(None, Some(3), None, Some(300.0), Some(220.0)),
            (3, 300.0, 220.0)
        );

        let partial: ResizeBalloonWindowParams =
            serde_json::from_str(r#"{"width": 350.0}"#).unwrap();
        assert_eq!(
            resolve_resize_balloon_args(Some(partial), None, Some(1), Some(999.0), Some(250.0)),
            (1, 350.0, 250.0)
        );

        assert_eq!(
            resolve_resize_balloon_args(None, None, None, None, None),
            (0, 0.0, 0.0)
        );
    }

    #[test]
    fn hide_params_and_scope_resolution_support_all_forms() {
        let camel: HideBalloonWindowParams = serde_json::from_str(r#"{"scopeId": 2}"#).unwrap();
        assert_eq!(camel.scope_id(), 2);
        assert_eq!(
            resolve_hide_balloon_scope(Some(camel), Some(9), Some(8), Some(7)),
            2
        );

        let snake: HideBalloonWindowParams = serde_json::from_str(r#"{"scope_id": 1}"#).unwrap();
        assert_eq!(resolve_hide_balloon_scope(Some(snake), None, None, None), 1);

        assert_eq!(resolve_hide_balloon_scope(None, Some(3), None, None), 3);
        assert_eq!(resolve_hide_balloon_scope(None, None, Some(4), None), 4);
        assert_eq!(resolve_hide_balloon_scope(None, None, None, Some(5)), 5);
        assert_eq!(resolve_hide_balloon_scope(None, None, None, None), 0);
    }

    #[test]
    fn show_params_and_clamping_support_all_forms() {
        let camel: ShowBalloonWindowParams = serde_json::from_str(
            r#"{"scopeId": 2, "theme": "ivory", "x": 100.0, "y": 50.0, "width": 320.0, "height": 220.0}"#,
        )
        .unwrap();
        assert_eq!(
            resolve_show_balloon_args(Some(camel), Some(9), Some(8), None, None, None, None, None),
            (
                2,
                Some("ivory".to_string()),
                Some(100.0),
                Some(50.0),
                Some(320.0),
                Some(220.0)
            )
        );

        let snake: ShowBalloonWindowParams =
            serde_json::from_str(r#"{"scope_id": 1, "theme": "nam"}"#).unwrap();
        assert_eq!(
            resolve_show_balloon_args(
                Some(snake),
                None,
                None,
                None,
                Some(10.0),
                Some(20.0),
                None,
                None
            ),
            (
                1,
                Some("nam".to_string()),
                Some(10.0),
                Some(20.0),
                None,
                None
            )
        );

        let empty = ShowBalloonWindowParams::default();
        assert_eq!(
            resolve_show_balloon_args(
                Some(empty),
                Some(3),
                None,
                Some("dark".to_string()),
                None,
                None,
                Some(300.0),
                Some(180.0)
            ),
            (
                3,
                Some("dark".to_string()),
                None,
                None,
                Some(300.0),
                Some(180.0)
            )
        );

        // 1. 通常高さでのYクランプ（タスクバー除外 work_area のみ）とX軸無制限の確認
        assert_eq!(
            clamp_logical_position_y_only(1800.0, 950.0, 200.0, 0.0, 1040.0),
            (1800.0, 840.0)
        );
        assert_eq!(
            clamp_logical_position_y_only(2500.0, 500.0, 200.0, 0.0, 1040.0),
            (2500.0, 500.0)
        );
        assert_eq!(
            clamp_logical_position_y_only(-500.0, -40.0, 200.0, 0.0, 1040.0),
            (-500.0, 0.0)
        );

        // 2. 非ゼロ work_area.position (例: 上部タスクバー work_y=40) と縦長ウィンドウ (height >= work_height)
        assert_eq!(
            clamp_logical_position_y_only(-300.0, 10.0, 200.0, 40.0, 1000.0),
            (-300.0, 40.0)
        );
        assert_eq!(
            clamp_logical_position_y_only(-300.0, 900.0, 200.0, 40.0, 1000.0),
            (-300.0, 840.0)
        );
        assert_eq!(
            clamp_logical_position_y_only(3000.0, 200.0, 1200.0, 40.0, 1000.0),
            (3000.0, 40.0)
        );
        assert_eq!(
            clamp_logical_position_y_only(100.0, 50.0, 1000.0, 40.0, 1000.0),
            (100.0, 40.0)
        );
    }

    #[test]
    fn hidpi_work_area_and_monitor_selection_cover_unrestricted_x_and_multi_monitor() {
        // HiDPI 1.5x (物理 work_area: x=1920, y=60, w=2880, h=1560 -> 論理: x=1280, y=40, w=1920, h=1040)
        let hidpi =
            LogicalWorkArea::from_physical_rects(1920, 60, 2880, 1560, 1920, 0, 2880, 1620, 1.5);
        assert_eq!(hidpi.x, 1280.0);
        assert_eq!(hidpi.y, 40.0);
        assert_eq!(hidpi.width, 1920.0);
        assert_eq!(hidpi.height, 1040.0);
        assert_eq!(hidpi.scale_factor, 1.5);

        // 下部クランプ: work_bottom(1080) - height(200) = 880; 左端はみ出しX(-150)は維持
        assert_eq!(
            clamp_logical_position_y_only(-150.0, 920.0, 200.0, hidpi.y, hidpi.height),
            (-150.0, 880.0)
        );
        assert!(needs_vertical_clamp(920.0, 200.0, hidpi.y, hidpi.height));
        assert!(!needs_vertical_clamp(500.0, 200.0, hidpi.y, hidpi.height));

        // 不正 scale_factor のフォールバック
        let invalid_scale =
            LogicalWorkArea::from_physical_rects(0, 40, 1920, 1040, 0, 0, 1920, 1080, 0.0);
        assert_eq!(invalid_scale.scale_factor, 1.0);
        assert_eq!(invalid_scale.y, 40.0);

        // マルチモニター選択: Xが画面外でも最寄りモニターを選択し、上下位置にも対応
        let monitors = vec![(0.0, 0.0, 1920.0, 1080.0), (1920.0, 100.0, 1920.0, 900.0)];
        assert_eq!(select_best_rect_index(&monitors, -200.0, 500.0), Some(0));
        assert_eq!(select_best_rect_index(&monitors, 2100.0, 50.0), Some(1));
        assert_eq!(select_best_rect_index(&monitors, 4000.0, 500.0), Some(1));

        // デフォルト位置: scope 0 はワークスペース右端あふれで左反転、scope 1 は左側配置（X無制限）
        assert_eq!(
            compute_default_logical_balloon_pos(0, 1600.0, 600.0, 200.0, 280.0, 0.0, 1840.0),
            (1330.0, 580.0)
        );
        assert_eq!(
            compute_default_logical_balloon_pos(1, 0.0, 600.0, 200.0, 280.0, 0.0, 1840.0),
            (-260.0, 580.0)
        );
    }
}
