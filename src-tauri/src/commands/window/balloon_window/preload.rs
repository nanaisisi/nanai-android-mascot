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
            .title("Nanai Menu")
            .inner_size(240.0, 540.0)
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
            .shadow(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .resizable(false)
            .visible(false)
            .build()
        {
            let _ = subchar_win.minimize();
        }
    }
    Ok(())
}
