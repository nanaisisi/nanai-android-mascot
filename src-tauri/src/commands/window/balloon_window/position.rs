#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize)]
#[serde(default)]
pub struct SetBalloonOffsetParams {
    #[serde(alias = "scopeId")]
    scope_id: Option<i32>,
    x: Option<i32>,
    y: Option<i32>,
}

impl SetBalloonOffsetParams {
    pub fn scope_id(&self) -> Option<i32> {
        self.scope_id
    }

    pub fn x(&self) -> Option<i32> {
        self.x
    }

    pub fn y(&self) -> Option<i32> {
        self.y
    }
}

#[tauri::command(rename_all = "snake_case")]
#[allow(non_snake_case)]
pub async fn set_balloon_offset(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, crate::common::state::AppState>,
    params: Option<SetBalloonOffsetParams>,
    scope_id: Option<i32>,
    scopeId: Option<i32>,
    x: Option<i32>,
    y: Option<i32>,
) -> Result<(), String> {
    let resolved_params = params.unwrap_or_default();
    let target_scope = resolved_params
        .scope_id()
        .or(scope_id)
        .or(scopeId)
        .unwrap_or(0);
    let target_x = resolved_params.x().or(x).unwrap_or(0);
    let target_y = resolved_params.y().or(y).unwrap_or(0);
    state
        .balloon_offsets
        .lock()
        .insert(target_scope, (target_x, target_y));
    sync_balloon_position_impl(&app_handle, &state, target_scope).await
}

#[allow(clippy::too_many_arguments)]
fn clamp_physical_position(
    x: i32,
    y: i32,
    width: i32,
    height: i32,
    mon_x: i32,
    mon_y: i32,
    mon_w: i32,
    mon_h: i32,
) -> (i32, i32) {
    let max_x = (mon_x + mon_w - width).max(mon_x);
    let max_y = (mon_y + mon_h - height).max(mon_y);
    (x.clamp(mon_x, max_x), y.clamp(mon_y, max_y))
}

#[allow(clippy::too_many_arguments)]
fn compute_default_balloon_offset(
    scope_id: i32,
    char_pos_x: i32,
    char_width: i32,
    balloon_width: i32,
    monitor_x: Option<i32>,
    monitor_w: Option<i32>,
) -> (i32, i32) {
    if scope_id == 0 {
        let overflows_right = match (monitor_x, monitor_w) {
            (Some(mon_x), Some(mon_w)) => {
                char_pos_x + char_width - 10 + balloon_width > mon_x + mon_w
            }
            _ => false,
        };
        if overflows_right {
            (-balloon_width + 10, -20)
        } else {
            (char_width - 20, -20)
        }
    } else {
        (-balloon_width + 20, -20)
    }
}

pub async fn sync_balloon_position_impl(
    app_handle: &tauri::AppHandle,
    state: &tauri::State<'_, crate::common::state::AppState>,
    scope_id: i32,
) -> Result<(), String> {
    use tauri::Manager;
    let char_label = format!("subchar_window_{}", scope_id);
    let balloon_label = format!("balloon_window_{}", scope_id);
    let (Some(char_win), Some(balloon_win)) = (
        app_handle.get_webview_window(&char_label),
        app_handle.get_webview_window(&balloon_label),
    ) else {
        return Ok(());
    };
    let Ok(char_pos) = char_win.outer_position() else {
        return Ok(());
    };
    let (mut char_size, mut balloon_size) = (
        char_win.outer_size().unwrap_or(tauri::PhysicalSize {
            width: 200,
            height: 360,
        }),
        balloon_win.outer_size().unwrap_or(tauri::PhysicalSize {
            width: 280,
            height: 200,
        }),
    );
    if char_size.width == 0 || char_size.height == 0 {
        char_size = tauri::PhysicalSize {
            width: 200,
            height: 360,
        };
    }
    if balloon_size.width == 0 || balloon_size.height == 0 {
        balloon_size = tauri::PhysicalSize {
            width: 280,
            height: 200,
        };
    }

    let monitor_opt = char_win
        .current_monitor()
        .ok()
        .flatten()
        .or_else(|| balloon_win.current_monitor().ok().flatten())
        .or_else(|| app_handle.primary_monitor().ok().flatten());
    let monitor_bounds = monitor_opt.as_ref().map(|m| {
        let pos = m.position();
        let size = m.size();
        (pos.x, pos.y, size.width as i32, size.height as i32)
    });

    // デフォルト位置計算:
    // メインキャラ (scope 0): 右側配置（右端あふれる場合は左側に反転）
    // サブキャラ (scope 1以降): 左側配置 (鏡像レイアウト)
    let default_offset = compute_default_balloon_offset(
        scope_id,
        char_pos.x,
        char_size.width as i32,
        balloon_size.width as i32,
        monitor_bounds.map(|(mx, _, _, _)| mx),
        monitor_bounds.map(|(_, _, mw, _)| mw),
    );

    let offset = state
        .balloon_offsets
        .lock()
        .get(&scope_id)
        .copied()
        .unwrap_or(default_offset);

    let (target_x, target_y) = if let Some((mon_x, mon_y, mon_w, mon_h)) = monitor_bounds {
        clamp_physical_position(
            char_pos.x + offset.0,
            char_pos.y + offset.1,
            balloon_size.width as i32,
            balloon_size.height as i32,
            mon_x,
            mon_y,
            mon_w,
            mon_h,
        )
    } else {
        (char_pos.x + offset.0, char_pos.y + offset.1)
    };

    balloon_win
        .set_position(tauri::Position::Physical(tauri::PhysicalPosition {
            x: target_x,
            y: target_y,
        }))
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn sync_balloon_position(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, crate::common::state::AppState>,
    scope_id: i32,
) -> Result<(), String> {
    sync_balloon_position_impl(&app_handle, &state, scope_id).await
}

#[tauri::command]
pub async fn reset_balloon_positions(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, crate::common::state::AppState>,
) -> Result<(), String> {
    state.balloon_offsets.lock().clear();
    let n = *state.num_characters.lock();
    let max_scopes = if n > 0 { n } else { 1 };
    for scope_id in 0..max_scopes {
        let _ = sync_balloon_position_impl(&app_handle, &state, scope_id).await;
    }
    Ok(())
}

#[tauri::command]
pub async fn save_balloon_offset_from_position(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, crate::common::state::AppState>,
    scope_id: i32,
) -> Result<(), String> {
    use tauri::Manager;
    let char_label = format!("subchar_window_{}", scope_id);
    let balloon_label = format!("balloon_window_{}", scope_id);
    let (Some(char_win), Some(balloon_win)) = (
        app_handle.get_webview_window(&char_label),
        app_handle.get_webview_window(&balloon_label),
    ) else {
        return Ok(());
    };
    let (Ok(char_pos), Ok(balloon_pos)) = (char_win.outer_position(), balloon_win.outer_position())
    else {
        return Ok(());
    };
    state.balloon_offsets.lock().insert(
        scope_id,
        (balloon_pos.x - char_pos.x, balloon_pos.y - char_pos.y),
    );
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_offset_flips_scope_zero_and_uses_top_aligned_y() {
        assert_eq!(
            compute_default_balloon_offset(0, 100, 200, 280, Some(0), Some(1920)),
            (180, -20)
        );
        assert_eq!(
            compute_default_balloon_offset(0, 1640, 200, 280, Some(0), Some(1920)),
            (-270, -20)
        );
        assert_eq!(
            compute_default_balloon_offset(1, 1400, 200, 280, Some(0), Some(1920)),
            (-260, -20)
        );
    }

    #[test]
    fn clamp_physical_position_keeps_balloon_within_monitor_bounds() {
        assert_eq!(
            clamp_physical_position(1700, 950, 280, 200, 0, 0, 1920, 1080),
            (1640, 880)
        );
        assert_eq!(
            clamp_physical_position(-50, -30, 280, 200, 0, 0, 1920, 1080),
            (0, 0)
        );
        assert_eq!(
            clamp_physical_position(-100, 50, 500, 300, 0, 0, 400, 250),
            (0, 0)
        );
    }
}
