/// 汎用サブキャラクター（スコープ N）ウィンドウ表示コマンド
#[tauri::command]
#[allow(unused_variables)]
pub async fn show_subchar_window(
    app_handle: tauri::AppHandle,
    scope_id: i32,
    x: Option<f64>,
    y: Option<f64>,
    width: Option<f64>,
    height: Option<f64>,
) -> Result<(), String> {
    #[cfg(desktop)]
    {
        use tauri::Manager;
        let win_width = width.unwrap_or(200.0);
        let win_height = height.unwrap_or(360.0);
        let label = format!("subchar_window_{}", scope_id);

        if let Some(sub_win) = app_handle.get_webview_window(&label) {
            if let (Some(px), Some(py)) = (x, y) {
                let _ = sub_win.set_position(tauri::Position::Physical(tauri::PhysicalPosition {
                    x: px as i32,
                    y: py as i32,
                }));
            }
            let _ = sub_win.show();
        } else {
            // スコープ番号に応じた配置 (スコープ0: メイン位置、スコープ1以降: その横へ配置)
            let (mut target_x, mut target_y) = if scope_id == 0 {
                (200.0, 200.0)
            } else {
                (200.0 + (scope_id as f64 * 220.0), 200.0)
            };

            // スコープ0が既に存在する場合はそれを基準に横に並べる
            if scope_id > 0
                && let Some(char0_win) = app_handle.get_webview_window("subchar_window_0")
                && let Ok(pos) = char0_win.outer_position()
            {
                target_x = (pos.x as f64) + (scope_id as f64 * 220.0);
                target_y = pos.y as f64;
            }

            if let (Some(px), Some(py)) = (x, y) {
                target_x = px;
                target_y = py;
            }

            let title = if scope_id == 0 {
                "Nanai Android Mascot - Main Character".to_string()
            } else {
                format!("Nanai Android Mascot - Character {}", scope_id)
            };

            let sub_win = tauri::WebviewWindowBuilder::new(
                &app_handle,
                &label,
                tauri::WebviewUrl::App(format!("character.html?scope={}", scope_id).into()),
            )
            .title(title)
            .inner_size(win_width, win_height)
            .transparent(true)
            .decorations(false)
            .always_on_top(true)
            .resizable(false)
            .position(target_x, target_y)
            .build()
            .map_err(|e| e.to_string())?;

            let _ = sub_win.show();
        }
    }
    Ok(())
}

/// 汎用サブキャラクター（スコープ N）ウィンドウ非表示コマンド (\s[-1])
#[tauri::command]
#[allow(unused_variables)]
pub async fn hide_subchar_window(
    app_handle: tauri::AppHandle,
    scope_id: i32,
) -> Result<(), String> {
    #[cfg(desktop)]
    {
        use tauri::Manager;
        let label = format!("subchar_window_{}", scope_id);
        if let Some(sub_win) = app_handle.get_webview_window(&label) {
            let _ = sub_win.hide();
        }
    }
    Ok(())
}

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
    #[cfg(desktop)]
    {
        use tauri::Manager;
        let win_width = width.unwrap_or(280.0);
        let win_height = height.unwrap_or(200.0);
        let label = format!("balloon_window_{}", scope_id);

        if let Some(balloon_win) = app_handle.get_webview_window(&label) {
            if let (Some(px), Some(py)) = (x, y) {
                let _ =
                    balloon_win.set_position(tauri::Position::Physical(tauri::PhysicalPosition {
                        x: px as i32,
                        y: py as i32,
                    }));
            }
            let _ = balloon_win.show();
        } else {
            // キャラクターウィンドウ（subchar_window_{scope}）の位置を取得し、その上部にバルーンを配置
            let char_label = format!("subchar_window_{}", scope_id);
            let (target_x, target_y) = if let (Some(px), Some(py)) = (x, y) {
                (px, py)
            } else if let Some(char_win) = app_handle.get_webview_window(&char_label) {
                if let Ok(pos) = char_win.outer_position() {
                    let bx = (pos.x as f64) - 40.0;
                    let by = ((pos.y as f64) - win_height + 20.0).max(10.0);
                    (bx, by)
                } else {
                    (200.0, 100.0)
                }
            } else {
                (200.0, 100.0)
            };

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
