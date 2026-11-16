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

/// 独立バルーン（スコープ N）ウィンドウ表示コマンド
#[tauri::command]
pub async fn show_balloon_window(
    _app_handle: tauri::AppHandle,
    scope_id: Option<i32>,
    #[allow(non_snake_case)]
    scopeId: Option<i32>,
    theme: Option<String>,
    x: Option<f64>,
    y: Option<f64>,
    width: Option<f64>,
    height: Option<f64>,
) -> Result<(), String> {
    #[cfg(desktop)]
    {
        let app_handle = _app_handle;
        let s_id = scope_id.or(scopeId).unwrap_or(0);
        let t_val = theme;
        let p_x = x;
        let p_y = y;
        let w_val = width;
        let h_val = height;

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
                        let char_size = char_win
                            .outer_size()
                            .unwrap_or(tauri::PhysicalSize {
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
                tauri::WebviewUrl::App(
                    format!("balloon.html?scope={s_id}{theme_query}").into(),
                ),
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
            .build()
            .map_err(|e| e.to_string())?;

            let _ = balloon_win.unminimize();
            let _ = balloon_win.set_always_on_top(true);
            let _ = balloon_win.show();
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

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ResizeBalloonWindowParams {
    scope_id: i32,
    width: f64,
    height: f64,
}

impl ResizeBalloonWindowParams {
    // Add getter methods
    pub fn scope_id(&self) -> i32 {
        self.scope_id
    }

    pub fn width(&self) -> f64 {
        self.width
    }

    pub fn height(&self) -> f64 {
        self.height
    }
}

/// バルーンウィンドウのサイズを画像実寸法に合せてリサイズするコマンド
#[tauri::command]
pub async fn resize_balloon_window(
    app_handle: tauri::AppHandle,
    params: ResizeBalloonWindowParams,
) -> Result<(), String> {
    #[cfg(desktop)]
    {
        let scope_id = params.scope_id();
        let width = params.width();
        let height = params.height();
        use tauri::Manager;
        let label = format!("balloon_window_{}", scope_id);
        if let Some(balloon_win) = app_handle.get_webview_window(&label) {
            let _ =
                balloon_win.set_size(tauri::Size::Logical(tauri::LogicalSize { width, height }));
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
