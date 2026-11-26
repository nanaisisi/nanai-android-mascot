use tauri::Emitter;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ShowMenuWindowParams {
    x: f64,
    y: f64,
    scope: Option<i32>,
}

impl ShowMenuWindowParams {
    pub fn new(x: f64, y: f64, scope: Option<i32>) -> Self {
        Self { x, y, scope }
    }

    // Add getter methods
    pub fn x(&self) -> f64 {
        self.x
    }

    pub fn y(&self) -> f64 {
        self.y
    }

    pub fn scope(&self) -> Option<i32> {
        self.scope
    }
}

/// バルーンスキン連動の独立ポップアップメニューウィンドウ表示コマンド (ウィンドウ枠外にはみ出して表示可能)
#[tauri::command]
pub async fn show_menu_window(
    _app_handle: tauri::AppHandle,
    params: ShowMenuWindowParams,
) -> Result<(), String> {
    #[cfg(desktop)]
    {
        let app_handle = _app_handle;
        let x = params.x();
        let y = params.y();
        let scope = params.scope();

        println!(
            "👉 show_menu_window called: x={}, y={}, scope={:?}",
            x, y, scope
        );
        use tauri::Manager;
        let menu_scope = scope.unwrap_or(0);
        // 既存ウィンドウが実測幅へフィット済みならその論理幅を再利用し、未生成時等は 220.0 を使用
        let win_width = app_handle
            .get_webview_window("menu_window")
            .and_then(|w| {
                let size = w.inner_size().ok()?;
                let scale = w.scale_factor().ok().filter(|&s| s > 0.0)?;
                let logical_w = size.width as f64 / scale;
                if (150.0..=380.0).contains(&logical_w) {
                    Some(logical_w)
                } else {
                    None
                }
            })
            .unwrap_or(220.0);
        let win_height = if menu_scope > 0 { 220.0 } else { 460.0 };

        let mut target_x = x;
        let mut target_y = y;

        // モニター境界を取得して画面内に収める
        let monitor_opt = if let Ok(monitors) = app_handle.available_monitors() {
            monitors
                .into_iter()
                .find(|m| {
                    let pos = m.position();
                    let size = m.size();
                    let scale = m.scale_factor();
                    let w = size.width as f64 / scale;
                    let h = size.height as f64 / scale;
                    let mx = pos.x as f64 / scale;
                    let my = pos.y as f64 / scale;
                    target_x >= mx && target_x <= mx + w && target_y >= my && target_y <= my + h
                })
                .or_else(|| app_handle.primary_monitor().ok().flatten())
        } else {
            app_handle.primary_monitor().ok().flatten()
        };

        if let Some(monitor) = monitor_opt {
            let size = monitor.size();
            let pos = monitor.position();
            let scale = monitor.scale_factor();
            let screen_w = size.width as f64 / scale;
            let screen_h = size.height as f64 / scale;
            let screen_x = pos.x as f64 / scale;
            let screen_y = pos.y as f64 / scale;

            // タスクバー・画面下端の安全領域 (底部余白60px) を考慮し、下端を超える場合は上方向へ裏返し展開
            let safe_bottom = screen_y + screen_h - 60.0;
            if target_y + win_height > safe_bottom {
                target_y = (target_y - win_height).max(screen_y + 10.0);
            }

            let max_x = screen_x + screen_w - win_width;
            let max_y = (screen_y + screen_h - win_height - 40.0).max(screen_y);

            target_x = target_x.max(screen_x).min(max_x);
            target_y = target_y.max(screen_y).min(max_y);
        }

        if let Some(sub_win) = app_handle.get_webview_window("submenu_window") {
            SUBMENU_VISIBLE_INTENT.store(false, std::sync::atomic::Ordering::SeqCst);
            let _ = sub_win.hide();
        }

        if let Some(menu_win) = app_handle.get_webview_window("menu_window") {
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
            return Ok(());
        }

        let menu_win = tauri::WebviewWindowBuilder::new(
            &app_handle,
            "menu_window",
            tauri::WebviewUrl::App(format!("menu-iframe.html?scope={}", menu_scope).into()),
        )
        .title("Nanai Android Mascot - Context Menu")
        .inner_size(win_width, win_height)
        .transparent(true)
        .decorations(false)
        .shadow(false)
        .always_on_top(true)
        .skip_taskbar(true)
        .resizable(false)
        .maximizable(false)
        .minimizable(false)
        .position(target_x, target_y)
        .initialization_script(
            "window.addEventListener('contextmenu', function(e) { e.preventDefault(); });",
        )
        .build()
        .map_err(|e| e.to_string())?;

        let _ = menu_win.show();
        let _ = menu_win.set_focus();
        let _ = menu_win.emit("sync-menu-scope", menu_scope);
    }
    Ok(())
}

/// メニューウィンドウサイズ変更コマンド
#[tauri::command]
pub async fn resize_menu_window(
    _app_handle: tauri::AppHandle,
    width: f64,
    height: f64,
) -> Result<(), String> {
    #[cfg(desktop)]
    {
        use tauri::Manager;
        let w = width.clamp(150.0, 380.0);
        let h = height.clamp(100.0, 650.0);
        if let Some(menu_win) = _app_handle.get_webview_window("menu_window") {
            let _ = menu_win.set_size(tauri::Size::Logical(tauri::LogicalSize {
                width: w,
                height: h,
            }));
        }
    }
    Ok(())
}

/// メニューウィンドウ非表示コマンド
#[tauri::command]
pub async fn hide_menu_window(_app_handle: tauri::AppHandle) -> Result<(), String> {
    #[cfg(desktop)]
    {
        let app_handle = _app_handle;
        use tauri::Manager;
        if let Some(menu_win) = app_handle.get_webview_window("menu_window") {
            let _ = menu_win.hide();
        }
        if let Some(sub_win) = app_handle.get_webview_window("submenu_window") {
            SUBMENU_VISIBLE_INTENT.store(false, std::sync::atomic::Ordering::SeqCst);
            let _ = sub_win.hide();
        }
    }
    Ok(())
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ShowSubmenuWindowParams {
    menu_type: String,
    x: f64,
    y: f64,
    width: Option<f64>,
    height: Option<f64>,
}

impl ShowSubmenuWindowParams {
    // Add getter methods
    pub fn menu_type(&self) -> &str {
        &self.menu_type
    }

    pub fn x(&self) -> f64 {
        self.x
    }

    pub fn y(&self) -> f64 {
        self.y
    }

    pub fn width(&self) -> Option<f64> {
        self.width
    }

    pub fn height(&self) -> Option<f64> {
        self.height
    }
}

#[cfg(desktop)]
static LAST_SUBMENU_ANCHOR: std::sync::Mutex<Option<(f64, f64)>> = std::sync::Mutex::new(None);

#[cfg(desktop)]
static SUBMENU_VISIBLE_INTENT: std::sync::atomic::AtomicBool =
    std::sync::atomic::AtomicBool::new(false);

#[cfg(desktop)]
fn compute_submenu_position(
    app_handle: &tauri::AppHandle,
    anchor_x: f64,
    anchor_y: f64,
    win_width: f64,
    win_height: f64,
) -> (f64, f64) {
    use tauri::Manager;
    let monitor_opt = if let Ok(monitors) = app_handle.available_monitors() {
        monitors
            .into_iter()
            .find(|m| {
                let pos = m.position();
                let size = m.size();
                let scale = m.scale_factor();
                let w = size.width as f64 / scale;
                let h = size.height as f64 / scale;
                let mx = pos.x as f64 / scale;
                let my = pos.y as f64 / scale;
                anchor_x >= mx && anchor_x <= mx + w && anchor_y >= my && anchor_y <= my + h
            })
            .or_else(|| app_handle.primary_monitor().ok().flatten())
    } else {
        app_handle.primary_monitor().ok().flatten()
    };

    if let Some(monitor) = monitor_opt {
        let work_area = monitor.work_area();
        let scale = monitor.scale_factor();
        let work_x = work_area.position.x as f64 / scale;
        let work_y = work_area.position.y as f64 / scale;
        let work_w = work_area.size.width as f64 / scale;
        let work_h = work_area.size.height as f64 / scale;

        let flip_check_width = win_width.max(240.0);
        let max_y = (work_y + work_h - win_height).max(work_y);

        let target_x = if anchor_x + flip_check_width > work_x + work_w {
            let parent_x = app_handle
                .get_webview_window("menu_window")
                .and_then(|w| {
                    let pos = w.outer_position().ok()?;
                    let s = w.scale_factor().ok().filter(|&v| v > 0.0)?;
                    Some(pos.x as f64 / s)
                })
                .unwrap_or(anchor_x - 220.0 - 2.0);
            (parent_x - win_width - 2.0).max(work_x)
        } else {
            anchor_x.max(work_x)
        };
        let target_y = anchor_y.max(work_y).min(max_y);
        (target_x, target_y)
    } else {
        (anchor_x, anchor_y)
    }
}

/// 独立サブメニューウィンドウ表示コマンド
#[tauri::command]
pub async fn show_submenu_window(
    _app_handle: tauri::AppHandle,
    params: ShowSubmenuWindowParams,
) -> Result<(), String> {
    #[cfg(desktop)]
    {
        let app_handle = _app_handle;
        let menu_type = params.menu_type().to_string();
        let x = params.x();
        let y = params.y();
        let width = params.width();
        let height = params.height();

        use tauri::Manager;
        let win_width = width.unwrap_or(220.0);
        let win_height = height.unwrap_or(320.0);

        SUBMENU_VISIBLE_INTENT.store(true, std::sync::atomic::Ordering::SeqCst);
        if let Ok(mut anchor) = LAST_SUBMENU_ANCHOR.lock() {
            *anchor = Some((x, y));
        }

        if let Some(sub_win) = app_handle.get_webview_window("submenu_window") {
            let _ = sub_win.set_decorations(false);
            let _ = sub_win.set_shadow(false);
            if sub_win.is_visible().unwrap_or(false) {
                let _ = sub_win.hide();
            }
        } else {
            let (target_x, target_y) =
                compute_submenu_position(&app_handle, x, y, win_width, win_height);
            let _sub_win = tauri::WebviewWindowBuilder::new(
                &app_handle,
                "submenu_window",
                tauri::WebviewUrl::App("submenu-iframe.html".into()),
            )
            .title("Nanai Android Mascot - Submenu")
            .inner_size(win_width, win_height)
            .transparent(true)
            .decorations(false)
            .shadow(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .resizable(false)
            .visible(false)
            .position(target_x, target_y)
            .build()
            .map_err(|e| e.to_string())?;
        }

        // サブメニュータイプを通知 (描画完了後の resize_submenu_window で確定表示)
        let _ = app_handle.emit("set-submenu-type", serde_json::json!({ "type": menu_type }));
    }
    Ok(())
}

/// サブメニューウィンドウサイズ変更・再配置コマンド
#[tauri::command]
pub async fn resize_submenu_window(
    _app_handle: tauri::AppHandle,
    width: f64,
    height: f64,
    show: Option<bool>,
) -> Result<(), String> {
    #[cfg(desktop)]
    {
        use tauri::Manager;
        if !SUBMENU_VISIBLE_INTENT.load(std::sync::atomic::Ordering::SeqCst) {
            return Ok(());
        }
        let w = width.clamp(120.0, 360.0);
        let h = height.clamp(32.0, 520.0);
        if let Some(sub_win) = _app_handle.get_webview_window("submenu_window") {
            if let Ok(anchor) = LAST_SUBMENU_ANCHOR.lock()
                && let Some((ax, ay)) = *anchor
            {
                let (tx, ty) = compute_submenu_position(&_app_handle, ax, ay, w, h);
                let _ = sub_win.set_position(tauri::Position::Logical(tauri::LogicalPosition {
                    x: tx,
                    y: ty,
                }));
            }
            let _ = sub_win.set_size(tauri::Size::Logical(tauri::LogicalSize {
                width: w,
                height: h,
            }));
            if show.unwrap_or(false) && !sub_win.is_visible().unwrap_or(false) {
                let _ = sub_win.show();
            }
        }
    }
    Ok(())
}

/// サブメニューウィンドウ非表示コマンド
#[tauri::command]
pub async fn hide_submenu_window(_app_handle: tauri::AppHandle) -> Result<(), String> {
    #[cfg(desktop)]
    {
        let app_handle = _app_handle;
        use tauri::Manager;
        if let Some(sub_win) = app_handle.get_webview_window("submenu_window") {
            SUBMENU_VISIBLE_INTENT.store(false, std::sync::atomic::Ordering::SeqCst);
            let _ = sub_win.hide();
        }
    }
    Ok(())
}
