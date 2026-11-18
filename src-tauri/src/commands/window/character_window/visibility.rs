//! キャラクター（メイン / サブキャラ）ウィンドウ表示・非表示コマンド

#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize)]
#[serde(default)]
pub struct ShowCharacterWindowParams {
    #[serde(alias = "scopeId")]
    scope_id: Option<i32>,
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
            scope_id: Some(scope_id),
            x,
            y,
            width,
            height,
        }
    }

    pub fn scope_id(&self) -> i32 {
        self.scope_id.unwrap_or(0)
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

#[cfg(desktop)]
fn monitor_logical_bounds(monitor: &tauri::Monitor) -> (f64, f64, f64, f64, f64) {
    let scale = monitor.scale_factor();
    let safe_scale = if scale > 0.0 && scale.is_finite() {
        scale
    } else {
        1.0
    };
    let mon_pos = monitor.position();
    let mon_size = monitor.size();
    let mon_x = (mon_pos.x as f64) / safe_scale;
    let mon_y = (mon_pos.y as f64) / safe_scale;
    let screen_w = (mon_size.width as f64) / safe_scale;
    let screen_h = (mon_size.height as f64) / safe_scale;
    (safe_scale, mon_x, mon_y, screen_w, screen_h)
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
        let win_width = width.unwrap_or(200.0).max(32.0);
        let win_height = height.unwrap_or(360.0).max(32.0);
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
                "(function(){var b=function(e){var t=e.target;var i=t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable);if(!i&&e.preventDefault){e.preventDefault();}};window.addEventListener('contextmenu',b,true);document.addEventListener('contextmenu',b,true);})();",
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
        let mut moved_or_resized = should_resize;
        if should_resize {
            let _ = sub_win.set_size(tauri::Size::Logical(tauri::LogicalSize {
                width: win_width,
                height: win_height,
            }));
        }

        if let (Some(px), Some(py)) = (x, y) {
            moved_or_resized = true;
            let _ = sub_win.set_position(tauri::Position::Physical(tauri::PhysicalPosition {
                x: px as i32,
                y: py as i32,
            }));
        } else if is_new || !is_visible {
            moved_or_resized = true;
            // モニター情報を取得して初回のみ画面右下 (デスクトップの床) に標準配置（論理座標でモニター内にクランプ）
            let mut target_x = 200.0;
            let mut target_y = 200.0;

            let monitor = sub_win
                .current_monitor()
                .ok()
                .flatten()
                .or_else(|| app_handle.primary_monitor().ok().flatten());

            if let Some(monitor) = monitor {
                let (safe_scale, mon_x, mon_y, screen_w, screen_h) =
                    monitor_logical_bounds(&monitor);
                let (eff_w, eff_h) = if should_resize {
                    (win_width, win_height)
                } else if let Ok(sz) = sub_win.outer_size() {
                    if sz.width > 0 && sz.height > 0 {
                        (
                            (sz.width as f64) / safe_scale,
                            (sz.height as f64) / safe_scale,
                        )
                    } else {
                        (win_width, win_height)
                    }
                } else {
                    (win_width, win_height)
                };

                // スコープ0 (メイン): 右下 (タスクバー上)
                if scope_id == 0 {
                    target_x = mon_x + screen_w - eff_w - 80.0;
                    target_y = mon_y + screen_h - eff_h - 120.0;
                } else {
                    // スコープ1以降 (サブ): メインの左側等に並べる
                    target_x = mon_x + screen_w - eff_w - 320.0 - (scope_id as f64 * 220.0);
                    target_y = mon_y + screen_h - eff_h - 120.0;
                }

                let max_x = (mon_x + screen_w - eff_w).max(mon_x);
                let max_y = (mon_y + screen_h - eff_h).max(mon_y);
                target_x = target_x.clamp(mon_x, max_x);
                target_y = target_y.clamp(mon_y, max_y);
            }

            let _ = sub_win.set_position(tauri::Position::Logical(tauri::LogicalPosition {
                x: target_x,
                y: target_y,
            }));
        } else if should_resize && !is_new && is_visible && x.is_none() && y.is_none() {
            // リサイズ時に画面右端・下端・左端・上端からはみ出さないようにモニター内にクランプ
            if let Ok(pos) = sub_win.outer_position() {
                let monitor = sub_win
                    .current_monitor()
                    .ok()
                    .flatten()
                    .or_else(|| app_handle.primary_monitor().ok().flatten());
                if let Some(monitor) = monitor {
                    let (safe_scale, mon_x, mon_y, screen_w, screen_h) =
                        monitor_logical_bounds(&monitor);
                    let pos_x = (pos.x as f64) / safe_scale;
                    let pos_y = (pos.y as f64) / safe_scale;

                    if pos_x + win_width > mon_x + screen_w
                        || pos_y + win_height > mon_y + screen_h
                        || pos_x < mon_x
                        || pos_y < mon_y
                    {
                        let max_x = (mon_x + screen_w - win_width).max(mon_x);
                        let max_y = (mon_y + screen_h - win_height).max(mon_y);
                        let clamped_x = pos_x.clamp(mon_x, max_x);
                        let clamped_y = pos_y.clamp(mon_y, max_y);
                        let _ = sub_win.set_position(tauri::Position::Logical(
                            tauri::LogicalPosition {
                                x: clamped_x,
                                y: clamped_y,
                            },
                        ));
                    }
                }
            }
        }

        let _ = sub_win.show();
        let _ = sub_win.set_focus();

        if moved_or_resized {
            if let Some(state) = app_handle.try_state::<crate::common::state::AppState>() {
                let _ = super::super::balloon_window::sync_balloon_position_impl(
                    &app_handle,
                    &state,
                    scope_id,
                )
                .await;
            }
        }
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

#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize)]
#[serde(default)]
pub struct ShowSubcharWindowParams {
    #[serde(alias = "scopeId")]
    scope_id: Option<i32>,
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
            scope_id: Some(scope_id),
            x,
            y,
            width,
            height,
        }
    }

    pub fn scope_id(&self) -> i32 {
        self.scope_id.unwrap_or(0)
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
#[tauri::command(rename_all = "snake_case")]
#[allow(non_snake_case)]
pub async fn show_subchar_window(
    _app_handle: tauri::AppHandle,
    params: Option<ShowSubcharWindowParams>,
    scope_id: Option<i32>,
    scopeId: Option<i32>,
    x: Option<f64>,
    y: Option<f64>,
    width: Option<f64>,
    height: Option<f64>,
) -> Result<(), String> {
    let app_handle = _app_handle;
    let p = params.unwrap_or_default();
    let resolved_scope_id = scope_id.or(scopeId).unwrap_or_else(|| p.scope_id());
    let resolved_x = x.or_else(|| p.x());
    let resolved_y = y.or_else(|| p.y());
    let resolved_width = width.or_else(|| p.width());
    let resolved_height = height.or_else(|| p.height());

    show_character_window(
        app_handle,
        ShowCharacterWindowParams::new(
            resolved_scope_id,
            resolved_x,
            resolved_y,
            resolved_width,
            resolved_height,
        ),
    )
    .await
}

/// 互換用: サブキャラクターウィンドウ非表示コマンド
#[tauri::command(rename_all = "snake_case")]
#[allow(non_snake_case)]
pub async fn hide_subchar_window(
    _app_handle: tauri::AppHandle,
    scope_id: Option<i32>,
    scopeId: Option<i32>,
    _scope_id: Option<i32>,
) -> Result<(), String> {
    let app_handle = _app_handle;
    let resolved_scope_id = scope_id.or(scopeId).or(_scope_id).unwrap_or(0);
    hide_character_window(app_handle, resolved_scope_id).await
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
        let label = format!("subchar_window_{}", scope_id);
        if let Some(win) = app_handle.get_webview_window(&label) {
            let _ = win.center();
        }
    }
    Ok(())
}
