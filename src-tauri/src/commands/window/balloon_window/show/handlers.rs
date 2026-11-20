use super::geometry::*;
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
pub fn resolve_show_balloon_args(
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

#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize)]
#[serde(default)]
pub struct ResizeBalloonWindowParams {
    #[serde(alias = "scopeId")]
    scope_id: Option<i32>,
    width: Option<f64>,
    height: Option<f64>,
}

impl ResizeBalloonWindowParams {
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
pub fn resolve_resize_balloon_args(
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
pub fn resolve_hide_balloon_scope(
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
