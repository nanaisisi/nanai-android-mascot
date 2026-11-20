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

#[cfg(any(desktop, test))]
fn sanitize_scale(scale: f64) -> f64 {
    if scale > 0.0 && scale.is_finite() {
        scale
    } else {
        1.0
    }
}

#[cfg(any(desktop, test))]
fn work_area_to_logical(
    pos_x: i32,
    pos_y: i32,
    width: u32,
    height: u32,
    scale: f64,
) -> (f64, f64, f64, f64, f64) {
    let safe_scale = sanitize_scale(scale);
    let work_x = (pos_x as f64) / safe_scale;
    let work_y = (pos_y as f64) / safe_scale;
    let work_w = (width as f64) / safe_scale;
    let work_h = (height as f64) / safe_scale;
    (safe_scale, work_x, work_y, work_w, work_h)
}

#[cfg(desktop)]
fn monitor_logical_work_area(monitor: &tauri::Monitor) -> (f64, f64, f64, f64, f64) {
    let work = monitor.work_area();
    work_area_to_logical(
        work.position.x,
        work.position.y,
        work.size.width,
        work.size.height,
        monitor.scale_factor(),
    )
}

#[cfg(any(desktop, test))]
fn compute_default_character_position(
    scope_id: i32,
    eff_w: f64,
    eff_h: f64,
    work_x: f64,
    work_y: f64,
    work_w: f64,
    work_h: f64,
) -> (f64, f64) {
    // スコープ0 (メイン): 右下 (タスクバー抜きワークスペース底面)
    // スコープ1以降 (サブ): メインの左側等に並べる
    let raw_x = if scope_id == 0 {
        work_x + work_w - eff_w - 80.0
    } else {
        work_x + work_w - eff_w - 320.0 - (scope_id as f64 * 220.0)
    };
    let raw_y = work_y + work_h - eff_h;

    // 初期未指定配置・リセット時のみワークスペース内に収める
    let max_x = (work_x + work_w - eff_w).max(work_x);
    let max_y = (work_y + work_h - eff_h).max(work_y);
    (raw_x.clamp(work_x, max_x), raw_y.clamp(work_y, max_y))
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

        if x.is_some() || y.is_some() {
            moved_or_resized = true;
            // シェルの位置指定は画面外・タスクバー上を含め上下左右とも制限しない
            let cur_pos = sub_win.outer_position().ok();
            let target_px = x
                .map(|v| v.round() as i32)
                .or_else(|| cur_pos.map(|p| p.x))
                .unwrap_or(200);
            let target_py = y
                .map(|v| v.round() as i32)
                .or_else(|| cur_pos.map(|p| p.y))
                .unwrap_or(200);
            let _ = sub_win.set_position(tauri::Position::Physical(tauri::PhysicalPosition {
                x: target_px,
                y: target_py,
            }));
        } else if is_new || !is_visible {
            moved_or_resized = true;
            // モニターのタスクバー抜きワークスペース (work_area) を取得して初回のみ右下基準に標準配置
            let mut target_x = 200.0;
            let mut target_y = 200.0;

            let monitor = sub_win
                .current_monitor()
                .ok()
                .flatten()
                .or_else(|| app_handle.primary_monitor().ok().flatten());

            if let Some(monitor) = monitor {
                let (safe_scale, work_x, work_y, work_w, work_h) =
                    monitor_logical_work_area(&monitor);
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

                (target_x, target_y) = compute_default_character_position(
                    scope_id, eff_w, eff_h, work_x, work_y, work_w, work_h,
                );
            }

            let _ = sub_win.set_position(tauri::Position::Logical(tauri::LogicalPosition {
                x: target_x,
                y: target_y,
            }));
        }

        if is_new || !is_visible {
            let _ = sub_win.show();
        }
        let menu_is_visible = app_handle
            .get_webview_window("menu_window")
            .and_then(|w| w.is_visible().ok())
            .unwrap_or(false);
        if is_new && !menu_is_visible {
            let _ = sub_win.set_focus();
        }

        if moved_or_resized
            && let Some(state) = app_handle.try_state::<crate::common::state::AppState>()
        {
            let _ = super::super::balloon_window::sync_balloon_position_impl(
                &app_handle,
                &state,
                scope_id,
            )
            .await;
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
    #[cfg(desktop)]
    {
        use std::collections::BTreeSet;
        use tauri::{Emitter, Manager};

        let n = *state.num_characters.lock();
        let max_scopes = if n > 0 { n } else { 2 };
        let mut scopes: BTreeSet<i32> = (0..max_scopes).collect();
        for label in app_handle.webview_windows().keys() {
            if let Some(suffix) = label.strip_prefix("subchar_window_")
                && let Ok(parsed) = suffix.parse::<i32>()
            {
                scopes.insert(parsed);
            }
        }

        let primary_monitor = app_handle.primary_monitor().ok().flatten();
        for scope_id in scopes {
            let label = format!("subchar_window_{}", scope_id);
            if let Some(win) = app_handle.get_webview_window(&label) {
                let monitor = primary_monitor
                    .clone()
                    .or_else(|| win.current_monitor().ok().flatten());
                let (target_x, target_y, safe_scale) = if let Some(ref monitor) = monitor {
                    let (scale, work_x, work_y, work_w, work_h) =
                        monitor_logical_work_area(monitor);
                    let (eff_w, eff_h) = if let Ok(sz) = win.outer_size() {
                        if sz.width > 0 && sz.height > 0 {
                            ((sz.width as f64) / scale, (sz.height as f64) / scale)
                        } else {
                            (200.0, 360.0)
                        }
                    } else {
                        (200.0, 360.0)
                    };
                    let (tx, ty) = compute_default_character_position(
                        scope_id, eff_w, eff_h, work_x, work_y, work_w, work_h,
                    );
                    (tx, ty, scale)
                } else {
                    (200.0, 200.0, 1.0)
                };

                let _ = win.set_position(tauri::Position::Logical(tauri::LogicalPosition {
                    x: target_x,
                    y: target_y,
                }));

                let (phys_x, phys_y) = match win.outer_position() {
                    Ok(pos) => (pos.x, pos.y),
                    Err(_) => (
                        (target_x * safe_scale).round() as i32,
                        (target_y * safe_scale).round() as i32,
                    ),
                };
                let _ = win.emit(
                    "character-positions-reset",
                    serde_json::json!({
                        "scopeId": scope_id,
                        "x": phys_x,
                        "y": phys_y,
                    }),
                );
                let _ = super::super::balloon_window::sync_balloon_position_impl(
                    &app_handle,
                    &state,
                    scope_id,
                )
                .await;
            }
        }
    }
    #[cfg(not(desktop))]
    {
        let _ = (&app_handle, &state);
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn work_area_to_logical_handles_taskbar_and_hidpi_scale() {
        assert_eq!(
            work_area_to_logical(0, 0, 1920, 1032, 1.0),
            (1.0, 0.0, 0.0, 1920.0, 1032.0)
        );
        assert_eq!(
            work_area_to_logical(90, 60, 2790, 1560, 1.5),
            (1.5, 60.0, 40.0, 1860.0, 1040.0)
        );
        assert_eq!(
            work_area_to_logical(0, 0, 1280, 720, 0.0),
            (1.0, 0.0, 0.0, 1280.0, 720.0)
        );
        assert_eq!(
            work_area_to_logical(0, 0, 1280, 720, f64::NAN),
            (1.0, 0.0, 0.0, 1280.0, 720.0)
        );
    }

    #[test]
    fn default_character_position_uses_work_area_bottom_right() {
        // 1920x1080 with 48px bottom taskbar -> work_area height = 1032
        assert_eq!(
            compute_default_character_position(0, 200.0, 360.0, 0.0, 0.0, 1920.0, 1032.0),
            (1640.0, 672.0)
        );
        // Subchar (scope 1) placed to the left of main character
        assert_eq!(
            compute_default_character_position(1, 200.0, 360.0, 0.0, 0.0, 1920.0, 1032.0),
            (1180.0, 672.0)
        );
        // Top/left taskbar work_area offset (60, 40) with HiDPI logical size
        assert_eq!(
            compute_default_character_position(0, 200.0, 360.0, 60.0, 40.0, 1860.0, 1040.0),
            (1640.0, 720.0)
        );
        // Oversized window stays anchored to work_area origin for initial unset default
        assert_eq!(
            compute_default_character_position(2, 500.0, 800.0, 60.0, 40.0, 400.0, 600.0),
            (60.0, 40.0)
        );
    }

    #[test]
    fn params_preserve_unclamped_offscreen_coordinates() {
        let p = ShowCharacterWindowParams::new(0, Some(-450.0), Some(-220.0), Some(200.0), None);
        assert_eq!(p.scope_id(), 0);
        assert_eq!(p.x(), Some(-450.0));
        assert_eq!(p.y(), Some(-220.0));
        assert_eq!(p.width(), Some(200.0));
        assert_eq!(p.height(), None);

        let parsed: ShowSubcharWindowParams = serde_json::from_str(
            r#"{"scopeId": 2, "x": 3840.0, "y": 2160.0, "width": 160.0, "height": 300.0}"#,
        )
        .expect("deserialize ShowSubcharWindowParams");
        assert_eq!(parsed.scope_id(), 2);
        assert_eq!(parsed.x(), Some(3840.0));
        assert_eq!(parsed.y(), Some(2160.0));
    }
}
