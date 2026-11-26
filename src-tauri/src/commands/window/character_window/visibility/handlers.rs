#[cfg(desktop)]
use super::geometry::{compute_default_character_position, monitor_logical_work_area};
use super::types::{ShowCharacterWindowParams, ShowSubcharWindowParams};

/// キャラクター（スコープ N）ウィンドウ表示コマンド (0=メイン, 1=サブ/うにゅ, 2以降=追加キャラ)
#[tauri::command]
pub(crate) async fn show_character_window(
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
            let _ = super::super::super::balloon_window::sync_balloon_position_impl(
                &app_handle,
                &state,
                scope_id,
            )
            .await;
        }
    }
    Ok(())
}

/// キャラクター（スコープ N）ウィンドウ非表示ヘルパー (\s[-1])
async fn hide_character_window(
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
#[tauri::command(rename_all = "snake_case")]
#[allow(non_snake_case)]
pub(crate) async fn show_subchar_window(
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
pub(crate) async fn hide_subchar_window(
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
pub(crate) async fn reset_character_positions(
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
                let _ = super::super::super::balloon_window::sync_balloon_position_impl(
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
