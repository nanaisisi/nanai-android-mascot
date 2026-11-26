//! キャラクターウィンドウ倍率設定およびバルーン位置同期コマンド

#[tauri::command]
pub(crate) async fn sync_character_balloon(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, crate::common::state::AppState>,
    scope_id: i32,
) -> Result<(), String> {
    super::balloon_window::sync_balloon_position_impl(&app_handle, &state, scope_id).await
}

#[cfg(any(desktop, test))]
fn resolve_character_scale_factor(
    scale_percent: Option<u32>,
    scale_percent_camel: Option<u32>,
    scale_percent_alias: Option<u32>,
    scale: Option<f64>,
) -> f64 {
    let raw_factor = if let Some(pct) = scale_percent
        .or(scale_percent_camel)
        .or(scale_percent_alias)
    {
        (pct as f64) / 100.0
    } else if let Some(s) = scale {
        if s > 10.0 { s / 100.0 } else { s }
    } else {
        1.0
    };
    if raw_factor.is_finite() {
        raw_factor.clamp(0.25, 3.0)
    } else {
        1.0
    }
}

/// キャラクター（スコープ N）ウィンドウのサイズ変更コマンド（シェル倍率変更用）
#[tauri::command(rename_all = "snake_case")]
#[allow(non_snake_case)]
pub(crate) async fn set_character_scale(
    _app_handle: tauri::AppHandle,
    scale_percent: Option<u32>,
    scalePercent: Option<u32>,
    _scale_percent: Option<u32>,
    scale: Option<f64>,
) -> Result<(), String> {
    #[cfg(desktop)]
    {
        use tauri::{Emitter, Manager};
        let app_handle = _app_handle;
        let factor =
            resolve_character_scale_factor(scale_percent, scalePercent, _scale_percent, scale);
        let payload = serde_json::json!({
            "scale": factor,
            "scalePercent": (factor * 100.0).round() as u32,
        });
        for (label, win) in app_handle.webview_windows() {
            if label.starts_with("subchar_window_") {
                let _ = win.emit("character-scale-changed", payload.clone());
            }
        }
    }
    #[cfg(not(desktop))]
    {
        let _ = (
            &_app_handle,
            scale_percent,
            scalePercent,
            _scale_percent,
            scale,
        );
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn resolves_character_scale_factor_clamped_to_supported_range() {
        assert_eq!(
            resolve_character_scale_factor(Some(150), None, None, None),
            1.5
        );
        assert_eq!(
            resolve_character_scale_factor(None, Some(200), None, None),
            2.0
        );
        assert_eq!(
            resolve_character_scale_factor(None, None, None, Some(150.0)),
            1.5
        );
        assert_eq!(
            resolve_character_scale_factor(None, None, None, Some(0.1)),
            0.25
        );
        assert_eq!(
            resolve_character_scale_factor(None, None, None, Some(5.0)),
            3.0
        );
        assert_eq!(
            resolve_character_scale_factor(None, None, None, Some(f64::NAN)),
            1.0
        );
    }
}
