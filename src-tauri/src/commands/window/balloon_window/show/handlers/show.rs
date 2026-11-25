use super::super::geometry::*;
use super::lock::{BALLOON_CREATION_LOCKS, BalloonLockGuard};
use super::params::ShowBalloonWindowParams;
#[cfg(desktop)]
use super::params::resolve_show_balloon_args;
use tauri::Emitter;

#[cfg(desktop)]
fn restore_menu_focus_if_visible(app_handle: &tauri::AppHandle) {
    use tauri::Manager;
    if let Some(menu_win) = app_handle.get_webview_window("menu_window")
        && menu_win.is_visible().unwrap_or(false)
    {
        let _ = menu_win.set_focus();
    }
}

#[allow(non_snake_case)]
#[cfg_attr(not(desktop), allow(unused_variables))]
#[allow(clippy::too_many_arguments)]
pub async fn execute_show_balloon_window(
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

            if let (Some((ox, oy)), Some(cw)) = (saved_offset, char_win.as_ref())
                && let Ok(char_pos) = cw.outer_position()
            {
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
                let (cx, cy) =
                    clamp_logical_position_y_only(raw_lx, raw_ly, actual_h, work.y, work.height);
                return (cx, cy, work.scale_factor);
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
