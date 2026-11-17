//! キャラクター（メイン / サブキャラ）ウィンドウ表示・非表示コマンド

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ShowCharacterWindowParams {
    scope_id: i32,
    x: Option<f64>,
    y: Option<f64>,
    width: Option<f64>,
    height: Option<f64>,
}

impl ShowCharacterWindowParams {
    pub fn new(
        scope_id: i32,
        x: Option<f64>,
        y: Option<f64>,
        width: Option<f64>,
        height: Option<f64>,
    ) -> Self {
        Self {
            scope_id,
            x,
            y,
            width,
            height,
        }
    }

    pub fn scope_id(&self) -> i32 {
        self.scope_id
    }

    pub fn x(&self) -> Option<f64> {
        self.x
    }

    pub fn y(&self) -> Option<f64> {
        self.y
    }

    pub fn width(&self) -> Option<f64> {
        self.width
    }

    pub fn height(&self) -> Option<f64> {
        self.height
    }
}

/// キャラクター（スコープ N）ウィンドウ表示コマンド (0=メイン, 1=サブ/うにゅ, 2以降=追加キャラ)
#[tauri::command]
pub async fn show_character_window(
    _app_handle: tauri::AppHandle,
    params: ShowCharacterWindowParams,
) -> Result<(), String> {
    #[cfg(desktop)]
    {
        let app_handle = _app_handle;
        let scope_id = params.scope_id();
        let x = params.x();
        let y = params.y();
        let width = params.width();
        let height = params.height();

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
                "window.addEventListener('contextmenu', function(e) { var t = e.target; var isInput = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable); if (!isInput) { e.preventDefault(); e.stopPropagation(); } }, true);",
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
                if scope_id == 0 {
                    target_x = screen_w - win_width - 80.0;
                    target_y = screen_h - win_height - 120.0;
                } else {
                    // スコープ1以降 (サブ): メインの左側等に並べる
                    target_x = (screen_w - win_width - 320.0 - (scope_id as f64 * 220.0)).max(50.0);
                    target_y = screen_h - win_height - 120.0;
                }
            }

            let _ = sub_win.set_position(tauri::Position::Physical(tauri::PhysicalPosition {
                x: target_x as i32,
                y: target_y as i32,
            }));
        }

        let _ = sub_win.show();
        let _ = sub_win.set_focus();
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

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ShowSubcharWindowParams {
    scope_id: i32,
    x: Option<f64>,
    y: Option<f64>,
    width: Option<f64>,
    height: Option<f64>,
}

impl ShowSubcharWindowParams {
    #[allow(dead_code)]
    pub fn new(
        scope_id: i32,
        x: Option<f64>,
        y: Option<f64>,
        width: Option<f64>,
        height: Option<f64>,
    ) -> Self {
        Self {
            scope_id,
            x,
            y,
            width,
            height,
        }
    }

    pub fn scope_id(&self) -> i32 {
        self.scope_id
    }

    pub fn x(&self) -> Option<f64> {
        self.x
    }

    pub fn y(&self) -> Option<f64> {
        self.y
    }

    pub fn width(&self) -> Option<f64> {
        self.width
    }

    pub fn height(&self) -> Option<f64> {
        self.height
    }
}

/// 互換用: サブキャラクターウィンドウ表示コマンド
#[tauri::command]
pub async fn show_subchar_window(
    _app_handle: tauri::AppHandle,
    params: ShowSubcharWindowParams,
) -> Result<(), String> {
    let app_handle = _app_handle;
    show_character_window(
        app_handle,
        ShowCharacterWindowParams::new(
            params.scope_id(),
            params.x(),
            params.y(),
            params.width(),
            params.height(),
        ),
    )
    .await
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

/// キャラクターウィンドウ位置リセットコマンド
#[tauri::command]
pub async fn reset_character_positions(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, crate::common::state::AppState>,
) -> Result<(), String> {
    use tauri::Manager;
    let n = *state.num_characters.lock();
    let max_scopes = if n > 0 { n } else { 2 };
    for scope_id in 0..max_scopes {
        let label = if scope_id == 0 {
            "main".to_string()
        } else {
            format!("subchar_window_{}", scope_id)
        };
        if let Some(win) = app_handle.get_webview_window(&label) {
            let _ = win.center();
        }
    }
    Ok(())
}
