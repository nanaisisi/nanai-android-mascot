/// 独立バルーン（スコープ N）ウィンドウ表示コマンド
#[tauri::command]
#[allow(unused_variables)]
pub async fn show_balloon_window(
    app_handle: tauri::AppHandle,
    scope_id: i32,
    x: Option<f64>,
    y: Option<f64>,
    width: Option<f64>,
    height: Option<f64>,
) -> Result<(), String> {
    println!("💬 show_balloon_window called: scope_id={}", scope_id);
    #[cfg(desktop)]
    {
        use tauri::Manager;
        let win_width = width.unwrap_or(280.0);
        let win_height = height.unwrap_or(200.0);
        let label = format!("balloon_window_{}", scope_id);

        let get_pos = || {
            if let (Some(px), Some(py)) = (x, y) {
                (px, py)
            } else {
                let char_label = format!("subchar_window_{}", scope_id);
                if let Some(char_win) = app_handle.get_webview_window(&char_label) {
                    if let Ok(pos) = char_win.outer_position() {
                        let bx = (pos.x as f64) - 40.0;
                        let by = ((pos.y as f64) - win_height + 20.0).max(10.0);
                        (bx, by)
                    } else {
                        (200.0 + (scope_id as f64 * 220.0), 100.0)
                    }
                } else {
                    (200.0 + (scope_id as f64 * 220.0), 100.0)
                }
            }
        };

        if let Some(balloon_win) = app_handle.get_webview_window(&label) {
            let (target_x, target_y) = get_pos();
            let _ = balloon_win.set_position(tauri::Position::Logical(tauri::LogicalPosition {
                x: target_x,
                y: target_y,
            }));
            let _ = balloon_win.show();
        } else {
            let (target_x, target_y) = get_pos();

            let title = format!("Nanai Mascot - Balloon {}", scope_id);
            let balloon_win = tauri::WebviewWindowBuilder::new(
                &app_handle,
                &label,
                tauri::WebviewUrl::App(format!("balloon.html?scope={}", scope_id).into()),
            )
            .title(title)
            .inner_size(win_width, win_height)
            .transparent(true)
            .decorations(false)
            .always_on_top(true)
            .resizable(true)
            .position(target_x, target_y)
            .build()
            .map_err(|e| e.to_string())?;

            let _ = balloon_win.show();
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
