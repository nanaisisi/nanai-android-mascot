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

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ShowBalloonWindowParams {
    pub scope_id: Option<i32>,
    #[serde(default)]
    pub theme: Option<String>,
    #[serde(default)]
    pub x: Option<f64>,
    #[serde(default)]
    pub y: Option<f64>,
    #[serde(default)]
    pub width: Option<f64>,
    #[serde(default)]
    pub height: Option<f64>,
}

/// 独立バルーン（スコープ N）ウィンドウ表示コマンド
#[tauri::command]
pub async fn show_balloon_window(
    app_handle: tauri::AppHandle,
    params: ShowBalloonWindowParams,
) -> Result<(), String> {
    #[cfg(desktop)]
    {
        let s_id = params.scope_id.unwrap_or(0);
        let t_val = params.theme;
        let p_x = params.x;
        let p_y = params.y;
        let w_val = params.width;
        let h_val = params.height;

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

        let get_pos = || {
            if let (Some(px), Some(py)) = (p_x, p_y) {
                (px, py)
            } else {
                let char_label = format!("subchar_window_{}", s_id);
                if let Some(char_win) = app_handle.get_webview_window(&char_label) {
                    if let Ok(pos) = char_win.outer_position() {
                        let scale = char_win
                            .current_monitor()
                            .unwrap_or(None)
                            .map(|m| m.scale_factor())
                            .unwrap_or(1.0);
                        let base_x = pos.x as f64 / scale;
                        let base_y = pos.y as f64 / scale;
                        let char_size = char_win.outer_size().unwrap_or(tauri::PhysicalSize {
                            width: 200,
                            height: 360,
                        });
                        let char_width = char_size.width as f64 / scale;

                        let monitor_width = char_win
                            .current_monitor()
                            .ok()
                            .flatten()
                            .map(|m| m.size().width as f64 / m.scale_factor())
                            .unwrap_or(1920.0);

                        let mut raw_x = base_x + char_width + 10.0;
                        if raw_x + win_width > monitor_width - 20.0 {
                            raw_x = base_x - win_width - 10.0;
                        }
                        raw_x = raw_x.max(10.0);

                        let raw_y = (base_y - 40.0).max(10.0);
                        (raw_x, raw_y)
                    } else {
                        (200.0 + (s_id as f64 * 220.0), 100.0)
                    }
                } else {
                    (200.0 + (s_id as f64 * 220.0), 100.0)
                }
            }
        };

        if let Some(balloon_win) = app_handle.get_webview_window(&label) {
            let (target_x, target_y) = get_pos();
            let _ = balloon_win.set_position(tauri::Position::Logical(tauri::LogicalPosition {
                x: target_x,
                y: target_y,
            }));

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
            let (target_x, target_y) = get_pos();

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
            }
        }
    }
    Ok(())
}

/// 独立バルーン（スコープ N）ウィンドウ非表示コマンド (\b[-1])
#[tauri::command]
pub async fn hide_balloon_window(
    _app_handle: tauri::AppHandle,
    _scope_id: i32,
) -> Result<(), String> {
    #[cfg(desktop)]
    {
        let app_handle = _app_handle;
        let scope_id = _scope_id;
        use tauri::Manager;
        let label = format!("balloon_window_{}", scope_id);
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
}
