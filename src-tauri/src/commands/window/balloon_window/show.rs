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
#[allow(clippy::too_many_arguments)]
fn clamp_logical_position(
    x: f64,
    y: f64,
    width: f64,
    height: f64,
    mon_x: f64,
    mon_y: f64,
    mon_w: f64,
    mon_h: f64,
) -> (f64, f64) {
    let max_x = (mon_x + mon_w - width).max(mon_x);
    let max_y = (mon_y + mon_h - height).max(mon_y);
    (x.clamp(mon_x, max_x), y.clamp(mon_y, max_y))
}

#[cfg(desktop)]
fn monitor_logical_bounds(monitor: &tauri::Monitor) -> (f64, f64, f64, f64) {
    let scale = monitor.scale_factor();
    let safe_scale = if scale > 0.0 { scale } else { 1.0 };
    let pos = monitor.position();
    let size = monitor.size();
    (
        pos.x as f64 / safe_scale,
        pos.y as f64 / safe_scale,
        size.width as f64 / safe_scale,
        size.height as f64 / safe_scale,
    )
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

        let monitor_opt = char_win
            .as_ref()
            .and_then(|w| w.current_monitor().ok().flatten())
            .or_else(|| {
                existing_balloon
                    .as_ref()
                    .and_then(|w| w.current_monitor().ok().flatten())
            })
            .or_else(|| app_handle.primary_monitor().ok().flatten());
        let (mon_x, mon_y, mon_w, mon_h) = monitor_opt
            .as_ref()
            .map(monitor_logical_bounds)
            .unwrap_or((0.0, 0.0, 1920.0, 1080.0));

        let balloon_scale = existing_balloon
            .as_ref()
            .and_then(|w| w.current_monitor().ok().flatten())
            .or_else(|| monitor_opt.clone())
            .map(|m| m.scale_factor())
            .filter(|s| *s > 0.0)
            .unwrap_or(1.0);
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

        let compute_clamped_pos = || {
            let (raw_x, raw_y) = if let (Some(px), Some(py)) = (p_x, p_y) {
                (px, py)
            } else {
                let (def_x, def_y) = if let Some(ref cw) = char_win {
                    if let Ok(pos) = cw.outer_position() {
                        let scale = cw
                            .current_monitor()
                            .ok()
                            .flatten()
                            .map(|m| m.scale_factor())
                            .filter(|s| *s > 0.0)
                            .unwrap_or(1.0);
                        let base_x = pos.x as f64 / scale;
                        let base_y = pos.y as f64 / scale;
                        let char_size = cw.outer_size().unwrap_or(tauri::PhysicalSize {
                            width: 200,
                            height: 360,
                        });
                        let char_width = char_size.width as f64 / scale;

                        let mut rx = base_x + char_width + 10.0;
                        if rx + actual_w > mon_x + mon_w - 20.0 {
                            rx = base_x - actual_w - 10.0;
                        }
                        let ry = base_y - 40.0;
                        (rx, ry)
                    } else {
                        (mon_x + 200.0 + (s_id as f64 * 220.0), mon_y + 100.0)
                    }
                } else {
                    (mon_x + 200.0 + (s_id as f64 * 220.0), mon_y + 100.0)
                };
                (p_x.unwrap_or(def_x), p_y.unwrap_or(def_y))
            };
            clamp_logical_position(raw_x, raw_y, actual_w, actual_h, mon_x, mon_y, mon_w, mon_h)
        };

        if let Some(balloon_win) = existing_balloon {
            let is_visible = balloon_win.is_visible().unwrap_or(false);
            let (target_x, target_y, should_set_pos) =
                if is_visible && p_x.is_none() && p_y.is_none() {
                    if let Ok(pos) = balloon_win.outer_position() {
                        let cur_x = pos.x as f64 / balloon_scale;
                        let cur_y = pos.y as f64 / balloon_scale;
                        let out_of_bounds = cur_x < mon_x
                            || cur_y < mon_y
                            || cur_x + actual_w > mon_x + mon_w
                            || cur_y + actual_h > mon_y + mon_h;
                        if out_of_bounds {
                            let (cx, cy) = clamp_logical_position(
                                cur_x, cur_y, actual_w, actual_h, mon_x, mon_y, mon_w, mon_h,
                            );
                            (cx, cy, true)
                        } else {
                            (cur_x, cur_y, false)
                        }
                    } else {
                        let (cx, cy) = compute_clamped_pos();
                        (cx, cy, true)
                    }
                } else {
                    let (cx, cy) = compute_clamped_pos();
                    (cx, cy, true)
                };

            if should_set_pos {
                let _ =
                    balloon_win.set_position(tauri::Position::Logical(tauri::LogicalPosition {
                        x: target_x,
                        y: target_y,
                    }));
            }

            let _ = balloon_win.unminimize();
            let _ = balloon_win.set_always_on_top(true);
            let _ = balloon_win.show();
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
            let (target_x, target_y) = compute_clamped_pos();

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

            let _ = balloon_win.unminimize();
            let _ = balloon_win.set_always_on_top(true);
            let _ = balloon_win.show();
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
                let monitor_opt = balloon_win
                    .current_monitor()
                    .ok()
                    .flatten()
                    .or_else(|| app_handle.primary_monitor().ok().flatten());
                if let (Ok(pos), Some(monitor)) = (balloon_win.outer_position(), monitor_opt) {
                    let (mon_x, mon_y, mon_w, mon_h) = monitor_logical_bounds(&monitor);
                    let scale = monitor.scale_factor();
                    let safe_scale = if scale > 0.0 { scale } else { 1.0 };
                    let pos_x = pos.x as f64 / safe_scale;
                    let pos_y = pos.y as f64 / safe_scale;
                    if pos_x + target_width > mon_x + mon_w
                        || pos_y + target_height > mon_y + mon_h
                        || pos_x < mon_x
                        || pos_y < mon_y
                    {
                        let (clamped_x, clamped_y) = clamp_logical_position(
                            pos_x,
                            pos_y,
                            target_width,
                            target_height,
                            mon_x,
                            mon_y,
                            mon_w,
                            mon_h,
                        );
                        let _ = balloon_win.set_position(tauri::Position::Logical(
                            tauri::LogicalPosition {
                                x: clamped_x,
                                y: clamped_y,
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
            serde_json::from_str(r#"{"scope_id": 1, "theme": "nsm"}"#).unwrap();
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
                Some("nsm".to_string()),
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

        assert_eq!(
            clamp_logical_position(1800.0, 950.0, 280.0, 200.0, 0.0, 0.0, 1920.0, 1080.0),
            (1640.0, 880.0)
        );
        assert_eq!(
            clamp_logical_position(-1950.0, -40.0, 280.0, 200.0, -1920.0, 0.0, 1920.0, 1080.0),
            (-1920.0, 0.0)
        );
    }
}
