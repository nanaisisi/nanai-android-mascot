/// バルーン・メニュー等の補助ウィンドウを事前に非表示状態で生成（キャッシュ）する
#[tauri::command]
pub async fn preload_auxiliary_windows(_app_handle: tauri::AppHandle) -> Result<(), String> {
    #[cfg(desktop)]
    {
        use tauri::Manager;
        let app_handle = _app_handle;
        let max_scopes =
            if let Some(state) = app_handle.try_state::<crate::common::state::AppState>() {
                let n = *state.num_characters.lock();
                if n > 0 { n } else { 1 }
            } else {
                3
            };

        // 1. バルーンウィンドウ (scope 0..max_scopes - 動的キャラクター数対応) の事前キャッシュ
        for scope_id in 0..max_scopes {
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
                .shadow(false)
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
            .title("Nanai Android Mascot - Context Menu")
            .inner_size(260.0, 720.0)
            .transparent(true)
            .decorations(false)
            .shadow(false)
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
            .title("Nanai Android Mascot - Submenu")
            .inner_size(220.0, 320.0)
            .transparent(true)
            .decorations(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .resizable(false)
            .visible(false)
            .build();
        }

        // 4. キャラクターウィンドウ (scope 0..max_scopes - 動的キャラクター数対応) を非表示状態で事前キャッシュ
        for scope_id in 0..max_scopes {
            let subchar_label = format!("subchar_window_{}", scope_id);
            if app_handle.get_webview_window(&subchar_label).is_none() {
                let _ = tauri::WebviewWindowBuilder::new(
                    &app_handle,
                    &subchar_label,
                    tauri::WebviewUrl::App(format!("character.html?scope={}", scope_id).into()),
                )
                .title(format!("Nanai Android Mascot - Character {}", scope_id))
                .inner_size(200.0, 360.0)
                .transparent(true)
                .decorations(false)
                .shadow(false)
                .always_on_top(true)
                .skip_taskbar(scope_id == 0)
                .resizable(false)
                .maximizable(false)
                .minimizable(false)
                .visible(false)
                .initialization_script(
                    "window.addEventListener('contextmenu', function(e) { e.preventDefault(); });",
                )
                .build();
            }
        }
    }
    Ok(())
}
