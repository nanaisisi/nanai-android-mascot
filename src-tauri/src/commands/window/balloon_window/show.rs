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
#[allow(unused_variables)]
pub async fn show_balloon_window(
    app_handle: tauri::AppHandle,
    scope_id: i32,
    theme: Option<String>,
    x: Option<f64>,
    y: Option<f64>,
    width: Option<f64>,
    height: Option<f64>,
) -> Result<(), String> {
    println!("💬 show_balloon_window called: scope_id={}", scope_id);
    #[cfg(desktop)]
    {
        use tauri::Manager;
        let label = format!("balloon_window_{}", scope_id);

        if app_handle.get_webview_window(&label).is_none() {
            let mut locks = BALLOON_CREATION_LOCKS.lock().map_err(|e| e.to_string())?;
            if locks.contains(&scope_id) {
                println!(
                    "⚠️ show_balloon_window creation already in progress for scope {}, skipping duplicate request.",
                    scope_id
                );
                return Ok(());
            }
            locks.insert(scope_id);
        }
        let _guard = BalloonLockGuard(scope_id);

        let win_width = width.unwrap_or(280.0);
        let win_height = height.unwrap_or(200.0);

        let get_pos = || {
            if let (Some(px), Some(py)) = (x, y) {
                (px, py)
            } else {
                let char_label = format!("subchar_window_{}", scope_id);
                if let Some(char_win) = app_handle.get_webview_window(&char_label) {
                    if let Ok(pos) = char_win.outer_position() {
                        let scale = char_win
                            .current_monitor()
                            .unwrap_or(None)
                            .map(|m| m.scale_factor())
                            .unwrap_or(1.0);
                        let base_x = pos.x as f64 / scale;
                        let base_y = pos.y as f64 / scale;

                        if scope_id == 0 {
                            (base_x + 180.0, base_y - 180.0) // メインは右上に配置
                        } else {
                            (base_x - 260.0, base_y - 180.0) // サブは左上に配置
                        }
                    } else {
                        (200.0 + (scope_id as f64 * 220.0), 100.0)
                    }
                } else {
                    (200.0 + (scope_id as f64 * 220.0), 100.0)
                }
            }
        };

        if let Some(balloon_win) = app_handle.get_webview_window(&label) {
            let is_vis = balloon_win
                .is_visible()
                .map_err(|e| format!("Failed to check balloon window visibility: {e}"))?;

            // 可視・不可視に関わらず位置を必ず同期する
            let (target_x, target_y) = get_pos();
            let _ = balloon_win.set_position(tauri::Position::Logical(tauri::LogicalPosition {
                x: target_x,
                y: target_y,
            }));

            if !is_vis {
                let _ = balloon_win.show();
            }
            if let Some(theme) = theme.filter(|value| !value.is_empty()) {
                let _ = app_handle.emit_to(
                    &label,
                    "balloon-theme-changed",
                    serde_json::json!({ "theme": theme }),
                );
            }
        } else {
            let (target_x, target_y) = get_pos();

            let title = format!("Nanai Mascot - Balloon {}", scope_id);
            let theme_query = theme
                .as_ref()
                .filter(|value| !value.is_empty())
                .map(|value| format!("&theme={value}"))
                .unwrap_or_default();
            let balloon_win = tauri::WebviewWindowBuilder::new(
                &app_handle,
                &label,
                tauri::WebviewUrl::App(
                    format!("balloon.html?scope={scope_id}{theme_query}").into(),
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

            let _ = balloon_win.show();
            if let Some(theme) = theme.filter(|value| !value.is_empty()) {
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

/// バルーンウィンドウのサイズを画像実寸法に合せてリサイズするコマンド
#[tauri::command]
pub async fn resize_balloon_window(
    app_handle: tauri::AppHandle,
    scope_id: i32,
    width: f64,
    height: f64,
) -> Result<(), String> {
    #[cfg(desktop)]
    {
        use tauri::Manager;
        let label = format!("balloon_window_{}", scope_id);
        if let Some(balloon_win) = app_handle.get_webview_window(&label) {
            let _ = balloon_win.set_size(tauri::Size::Logical(tauri::LogicalSize {
                width,
                height,
            }));
        }
    }
    Ok(())
}

/// 独立バルーン（スコープ N）ウィンドウ非表示コマンド (\b[-1])
#[tauri::command]
#[allow(unused_variables)]
pub async fn hide_balloon_window(
    app_handle: tauri::AppHandle,
    scope_id: i32,
) -> Result<(), String> {
    #[cfg(desktop)]
    {
        use tauri::Manager;
        let label = format!("balloon_window_{}", scope_id);
        if let Some(balloon_win) = app_handle.get_webview_window(&label) {
            let _ = balloon_win.hide();
        }
    }
    Ok(())
}
