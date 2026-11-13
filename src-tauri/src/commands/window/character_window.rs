/// キャラクター（スコープ N）ウィンドウ表示コマンド (0=メイン, 1=サブ/うにゅ, 2以降=追加キャラ)
#[tauri::command]
pub async fn show_character_window(
    _app_handle: tauri::AppHandle,
    _scope_id: i32,
    _x: Option<f64>,
    _y: Option<f64>,
    _width: Option<f64>,
    _height: Option<f64>,
) -> Result<(), String> {
    #[cfg(desktop)]
    {
        let app_handle = _app_handle;
        let scope_id = _scope_id;
        let x = _x;
        let y = _y;
        let width = _width;
        let height = _height;
        println!(
            "🪟 [Rust Window] show_character_window 呼び出し: scope={}, width={:?}, height={:?}",
            scope_id, width, height
        );
        use tauri::Manager;
        let win_width = width.unwrap_or(200.0).max(100.0);
        let win_height = height.unwrap_or(360.0).max(100.0);
        let label = format!("subchar_window_{}", scope_id);

        let mut is_new = false;
        let sub_win = if let Some(win) = app_handle.get_webview_window(&label) {
            println!(
                "🪟 [Rust Window] 既存の character ウィンドウを取得: label={}",
                label
            );
            win
        } else {
            is_new = true;
            println!(
                "🪟 [Rust Window] 新規 character ウィンドウを構築: label={}",
                label
            );
            let title = if scope_id == 0 {
                "Nanai Android Mascot - Main Character".to_string()
            } else {
                format!("Nanai Android Mascot - Character {}", scope_id)
            };

            tauri::WebviewWindowBuilder::new(
                &app_handle,
                &label,
                tauri::WebviewUrl::App(format!("character.html?scope={}", scope_id).into()),
            )
            .title(title)
            .inner_size(win_width, win_height)
            .transparent(true)
            .decorations(false)
            .shadow(false)
            .always_on_top(true)
            .skip_taskbar(false)
            .resizable(false)
            .maximizable(false)
            .minimizable(false)
            .visible(false)
            .initialization_script(
                "window.addEventListener('contextmenu', function(e) { e.preventDefault(); });",
            )
            .build()
            .map_err(|e| {
                println!("❌ [Rust Window] character ウィンドウ構築エラー: {}", e);
                e.to_string()
            })?
        };

        let is_visible = sub_win.is_visible().unwrap_or(false);

        let _ = sub_win.set_decorations(false);
        let _ = sub_win.set_shadow(false);

        // 既存ウィンドウが存在し、明示的なサイズ指定がない場合はサイズを維持してリロード時のチラつき・縮小を防ぐ
        let should_resize = width.is_some() || height.is_some() || is_new;
        if should_resize {
            let _ = sub_win.set_size(tauri::Size::Logical(tauri::LogicalSize {
                width: win_width,
                height: win_height,
            }));
        }

        if let (Some(px), Some(py)) = (x, y) {
            let _ = sub_win.set_position(tauri::Position::Physical(tauri::PhysicalPosition {
                x: px as i32,
                y: py as i32,
            }));
        } else if is_new || !is_visible {
            // モニター情報を取得して初回のみ画面右下 (デスクトップの床) に標準配置
            let mut target_x = 200.0;
            let mut target_y = 200.0;

            if let Ok(Some(monitor)) = app_handle.primary_monitor() {
                let size = monitor.size();
                let scale = monitor.scale_factor();
                let screen_w = (size.width as f64) / scale;
                let screen_h = (size.height as f64) / scale;

                // スコープ0 (メイン): 右下 (タスクバー上)
                // スコープ1 (サブ/うにゅう): メインの左隣
                target_x = if scope_id == 0 {
                    screen_w - win_width - 260.0
                } else {
                    screen_w - win_width - 40.0
                };
                target_y = (screen_h - win_height - 60.0).max(40.0);
            }

            // スコープ0が既に存在する場合はそれを基準に横に並べる (スコープNに応じたオフセット)
            if scope_id > 0
                && let Some(char0_win) = app_handle.get_webview_window("subchar_window_0")
                && let Ok(pos) = char0_win.outer_position()
            {
                let scale = char0_win
                    .current_monitor()
                    .unwrap_or(None)
                    .map(|m| m.scale_factor())
                    .unwrap_or(1.0);
                target_x = (pos.x as f64 / scale) - (220.0 * scope_id as f64);
                target_y = pos.y as f64 / scale;
            }

            let _ = sub_win.set_position(tauri::Position::Logical(tauri::LogicalPosition {
                x: target_x,
                y: target_y,
            }));
        }

        let _ = sub_win.set_skip_taskbar(false);
        let _ = sub_win.unminimize();
        let _ = sub_win.show();
        println!(
            "🪟 [Rust Window] character ウィンドウを表示完了: label={}",
            label
        );
    }
    Ok(())
}

/// キャラクター（スコープ N）ウィンドウ非表示コマンド (\s[-1])
#[tauri::command]
pub async fn hide_character_window(
    _app_handle: tauri::AppHandle,
    _scope_id: i32,
) -> Result<(), String> {
    #[cfg(desktop)]
    {
        let app_handle = _app_handle;
        let scope_id = _scope_id;
        use tauri::Manager;
        let label = format!("subchar_window_{}", scope_id);
        if let Some(sub_win) = app_handle.get_webview_window(&label) {
            let _ = sub_win.hide();
        }
    }
    Ok(())
}

/// 互換用: サブキャラクターウィンドウ表示コマンド
#[tauri::command]
pub async fn show_subchar_window(
    _app_handle: tauri::AppHandle,
    _scope_id: i32,
    _x: Option<f64>,
    _y: Option<f64>,
    _width: Option<f64>,
    _height: Option<f64>,
) -> Result<(), String> {
    let app_handle = _app_handle;
    let scope_id = _scope_id;
    let x = _x;
    let y = _y;
    let width = _width;
    let height = _height;
    show_character_window(app_handle, scope_id, x, y, width, height).await
}

#[tauri::command]
pub async fn sync_character_balloon(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, crate::common::state::AppState>,
    scope_id: i32,
) -> Result<(), String> {
    super::balloon_window::sync_balloon_position_impl(&app_handle, &state, scope_id).await
}

/// キャラクター（スコープ N）ウィンドウのサイズ変更コマンド（シェル倍率変更用）
#[tauri::command]
pub async fn set_character_scale(
    _app_handle: tauri::AppHandle,
    _scale_percent: u32,
) -> Result<(), String> {
    #[cfg(desktop)]
    {
        let app_handle = _app_handle;
        let scale_percent = _scale_percent;
        use tauri::Manager;
        let factor = (scale_percent as f64) / 100.0;
        let win_width = (200.0 * factor).round().max(80.0);
        let win_height = (360.0 * factor).round().max(140.0);
        for (label, win) in app_handle.webview_windows() {
            if label.starts_with("subchar_window_") {
                let _ = win.set_size(tauri::Size::Physical(tauri::PhysicalSize {
                    width: win_width as u32,
                    height: win_height as u32,
                }));
            }
        }
    }
    Ok(())
}

/// 互換用: サブキャラクターウィンドウ非表示コマンド
#[tauri::command]
pub async fn hide_subchar_window(
    _app_handle: tauri::AppHandle,
    _scope_id: i32,
) -> Result<(), String> {
    let app_handle = _app_handle;
    let scope_id = _scope_id;
    hide_character_window(app_handle, scope_id).await
}

#[tauri::command]
pub async fn set_surface_image(
    state: tauri::State<'_, crate::common::state::AppState>,
    scope_id: i32,
    image_src: String,
) -> Result<(), String> {
    state.surface_images.lock().insert(scope_id, image_src);
    Ok(())
}

#[tauri::command]
pub async fn get_surface_image(
    state: tauri::State<'_, crate::common::state::AppState>,
    scope_id: i32,
) -> Result<String, String> {
    let images = state.surface_images.lock();
    images
        .get(&scope_id)
        .cloned()
        .ok_or_else(|| format!("Surface image not found for scope {}", scope_id))
}
