use tauri::Emitter;

/// バルーンスキン連動の独立ポップアップメニューウィンドウ表示コマンド (ウィンドウ枠外にはみ出して表示可能)
#[tauri::command]
#[allow(unused_variables)]
pub async fn show_menu_window(
    app_handle: tauri::AppHandle,
    x: f64,
    y: f64,
    scope: Option<i32>,
) -> Result<(), String> {
    println!(
        "👉 show_menu_window called: x={}, y={}, scope={:?}",
        x, y, scope
    );
    #[cfg(desktop)]
    {
        use tauri::Manager;
        let menu_scope = scope.unwrap_or(0);
        // メインメニューの実寸 (240x540: 終了ボタン・フッターまで収まるサイズ, サブキャラ用は420)
        let win_width = 240.0;
        let win_height = if menu_scope > 0 { 420.0 } else { 540.0 };

        let mut target_x = x;
        let mut target_y = y;

        // モニター境界を取得して画面内に収める
        if let Ok(Some(monitor)) = app_handle.primary_monitor() {
            let screen_size = monitor.size();
            let screen_pos = monitor.position();
            let max_x = (screen_pos.x + screen_size.width as i32) as f64 - win_width;
            let max_y = (screen_pos.y + screen_size.height as i32) as f64 - win_height;

            if target_x > max_x {
                target_x = max_x.max(screen_pos.x as f64);
            }
            if target_y > max_y {
                // 画面下端に近い項目は、項目の下端にサブメニューの下端を合わせて上方向へ展開する。
                // 親メニューの項目高は通常 40px 前後で、単純な max_y への切り詰めでは
                // サブメニューが画面下端と重なりやすい。
                let anchor_height = 40.0;
                target_y = (target_y - win_height + anchor_height).max(screen_pos.y as f64);
            }
        }

        if let Some(menu_win) = app_handle.get_webview_window("menu_window") {
            let _ = menu_win.set_decorations(false);
            let _ = menu_win.set_shadow(false);
            let _ = menu_win.set_size(tauri::Size::Logical(tauri::LogicalSize {
                width: win_width,
                height: win_height,
            }));
            let _ = menu_win.set_position(tauri::Position::Logical(tauri::LogicalPosition {
                x: target_x,
                y: target_y,
            }));
            let _ = menu_win.show();
            let _ = menu_win.set_focus();
            let _ = menu_win.emit("sync-menu-scope", menu_scope);
        } else {
            let menu_win = tauri::WebviewWindowBuilder::new(
                &app_handle,
                "menu_window",
                tauri::WebviewUrl::App(format!("menu-iframe.html?scope={}", menu_scope).into()),
            )
            .title("Nanai Menu")
            .inner_size(win_width, win_height)
            .transparent(true)
            .decorations(false)
            .shadow(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .resizable(false)
            .position(target_x, target_y)
            .build()
            .map_err(|e| e.to_string())?;

            let _ = menu_win.show();
            let _ = menu_win.set_focus();
            let _ = menu_win.emit("sync-menu-scope", menu_scope);
        }
    }
    Ok(())
}

/// メニューウィンドウ非表示コマンド
#[tauri::command]
#[allow(unused_variables)]
pub async fn hide_menu_window(app_handle: tauri::AppHandle) -> Result<(), String> {
    #[cfg(desktop)]
    {
        use tauri::Manager;
        if let Some(menu_win) = app_handle.get_webview_window("menu_window") {
            let _ = menu_win.hide();
        }
        if let Some(sub_win) = app_handle.get_webview_window("submenu_window") {
            let _ = sub_win.hide();
        }
    }
    Ok(())
}

/// 独立サブメニューウィンドウ表示コマンド
#[tauri::command]
#[allow(unused_variables)]
pub async fn show_submenu_window(
    app_handle: tauri::AppHandle,
    menu_type: String,
    x: f64,
    y: f64,
    width: Option<f64>,
    height: Option<f64>,
) -> Result<(), String> {
    #[cfg(desktop)]
    {
        use tauri::Manager;
        let win_width = width.unwrap_or(220.0);
        let win_height = height.unwrap_or(320.0);

        let mut target_x = x;
        let mut target_y = y;

        if let Ok(Some(monitor)) = app_handle.primary_monitor() {
            let screen_size = monitor.size();
            let screen_pos = monitor.position();
            let max_x = (screen_pos.x + screen_size.width as i32) as f64 - win_width;
            let max_y = (screen_pos.y + screen_size.height as i32) as f64 - win_height;

            if target_x > max_x {
                // 右端を超える場合は左側へ反転 (親メニューの左横へ)
                target_x = (x - win_width - 240.0).max(screen_pos.x as f64);
            }
            if target_y > max_y {
                target_y = max_y.max(screen_pos.y as f64);
            }
        }

        if let Some(sub_win) = app_handle.get_webview_window("submenu_window") {
            let _ = sub_win.set_decorations(false);
            let _ = sub_win.set_shadow(false);
            let _ = sub_win.set_size(tauri::Size::Logical(tauri::LogicalSize {
                width: win_width,
                height: win_height,
            }));
            let _ = sub_win.set_position(tauri::Position::Logical(tauri::LogicalPosition {
                x: target_x,
                y: target_y,
            }));
            let _ = sub_win.show();
        } else {
            let sub_win = tauri::WebviewWindowBuilder::new(
                &app_handle,
                "submenu_window",
                tauri::WebviewUrl::App("submenu-iframe.html".into()),
            )
            .title("Nanai Submenu")
            .inner_size(win_width, win_height)
            .transparent(true)
            .decorations(false)
            .shadow(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .resizable(false)
            .position(target_x, target_y)
            .build()
            .map_err(|e| e.to_string())?;

            let _ = sub_win.show();
        }

        // サブメニュータイプを通知
        let _ = app_handle.emit("set-submenu-type", serde_json::json!({ "type": menu_type }));
    }
    Ok(())
}

/// サブメニューウィンドウ非表示コマンド
#[tauri::command]
#[allow(unused_variables)]
pub async fn hide_submenu_window(app_handle: tauri::AppHandle) -> Result<(), String> {
    #[cfg(desktop)]
    {
        use tauri::Manager;
        if let Some(sub_win) = app_handle.get_webview_window("submenu_window") {
            let _ = sub_win.hide();
        }
    }
    Ok(())
}
