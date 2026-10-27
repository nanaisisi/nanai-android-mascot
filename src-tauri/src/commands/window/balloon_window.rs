/// 独立バルーン（スコープ N）ウィンドウ表示コマンド
use tauri::Emitter;

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
            let is_vis = balloon_win.is_visible().unwrap_or(false);
            if !is_vis {
                let (target_x, target_y) = get_pos();
                let _ =
                    balloon_win.set_position(tauri::Position::Logical(tauri::LogicalPosition {
                        x: target_x,
                        y: target_y,
                    }));
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

/// バルーン・メニュー等の補助ウィンドウを事前に非表示状態で生成（キャッシュ）する
#[tauri::command]
#[allow(unused_variables)]
pub async fn preload_auxiliary_windows(app_handle: tauri::AppHandle) -> Result<(), String> {
    #[cfg(desktop)]
    {
        use tauri::Manager;

        // 1. バルーンウィンドウ (scope 0: メイン, scope 1: サブキャラ) の事前キャッシュ
        for scope_id in [0, 1] {
            let label = format!("balloon_window_{}", scope_id);
            if app_handle.get_webview_window(&label).is_none() {
                let title = format!("Nanai Mascot - Balloon {}", scope_id);
                let _ = tauri::WebviewWindowBuilder::new(
                    &app_handle,
                    &label,
                    tauri::WebviewUrl::App(format!("balloon.html?scope={}", scope_id).into()),
                )
                .title(title)
                .inner_size(280.0, 200.0)
                .transparent(true)
                .decorations(false)
                .always_on_top(true)
                .skip_taskbar(true)
                .resizable(true)
                .visible(false)
                .build();
            }
        }

        // 2. メインメニューウィンドウの事前キャッシュ
        if app_handle.get_webview_window("menu_window").is_none() {
            let _ = tauri::WebviewWindowBuilder::new(
                &app_handle,
                "menu_window",
                tauri::WebviewUrl::App("menu-iframe.html?scope=0".into()),
            )
            .title("Nanai Menu")
            .inner_size(240.0, 540.0)
            .transparent(true)
            .decorations(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .resizable(false)
            .visible(false)
            .build();
        }

        // 3. サブメニューウィンドウの事前キャッシュ
        if app_handle.get_webview_window("submenu_window").is_none() {
            let _ = tauri::WebviewWindowBuilder::new(
                &app_handle,
                "submenu_window",
                tauri::WebviewUrl::App("submenu-iframe.html".into()),
            )
            .title("Nanai Submenu")
            .inner_size(220.0, 320.0)
            .transparent(true)
            .decorations(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .resizable(false)
            .visible(false)
            .build();
        }

        // 4. サブキャラクターウィンドウ (scope 1: うにゅう/相方) を最小化・非表示状態で事前キャッシュ
        let subchar_label = "subchar_window_1";
        if app_handle.get_webview_window(subchar_label).is_none()
            && let Ok(subchar_win) = tauri::WebviewWindowBuilder::new(
                &app_handle,
                subchar_label,
                tauri::WebviewUrl::App("character.html?scope=1".into()),
            )
            .title("Nanai Android Mascot - Character 1")
            .inner_size(200.0, 360.0)
            .transparent(true)
            .decorations(false)
            .always_on_top(true)
            .resizable(false)
            .visible(false)
            .build()
        {
            let _ = subchar_win.minimize();
        }
    }
    Ok(())
}
