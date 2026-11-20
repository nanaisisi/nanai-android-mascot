use super::super::geometry::*;
use super::params::{ResizeBalloonWindowParams, resolve_resize_balloon_args};

#[allow(non_snake_case)]
#[cfg_attr(not(desktop), allow(unused_variables))]
pub async fn execute_resize_balloon_window(
    app_handle: tauri::AppHandle,
    params: Option<ResizeBalloonWindowParams>,
    scope_id: Option<i32>,
    scopeId: Option<i32>,
    width: Option<f64>,
    height: Option<f64>,
) -> Result<(), String> {
    #[cfg(desktop)]
    {
        let (target_scope, target_width, target_height) =
            resolve_resize_balloon_args(params, scope_id, scopeId, width, height);
        if target_width.is_finite()
            && target_height.is_finite()
            && target_width > 0.0
            && target_height > 0.0
        {
            use tauri::Manager;
            let label = format!("balloon_window_{}", target_scope);
            if let Some(balloon_win) = app_handle.get_webview_window(&label) {
                let _ = balloon_win.set_size(tauri::Size::Logical(tauri::LogicalSize {
                    width: target_width,
                    height: target_height,
                }));
                let char_label = format!("subchar_window_{}", target_scope);
                let monitor_opt = monitor_from_window_center(&app_handle, &balloon_win)
                    .or_else(|| {
                        app_handle
                            .get_webview_window(&char_label)
                            .and_then(|cw| monitor_from_window_center(&app_handle, &cw))
                    })
                    .or_else(|| app_handle.primary_monitor().ok().flatten());
                if let (Ok(pos), Some(monitor)) = (balloon_win.outer_position(), monitor_opt) {
                    let work = monitor_logical_work_area(&monitor);
                    let pos_y = pos.y as f64 / work.scale_factor;
                    if needs_vertical_clamp(pos_y, target_height, work.y, work.height) {
                        let (_, clamped_y) = clamp_logical_position_y_only(
                            pos.x as f64 / work.scale_factor,
                            pos_y,
                            target_height,
                            work.y,
                            work.height,
                        );
                        let clamped_phys_y = (clamped_y * work.scale_factor).round() as i32;
                        let _ = balloon_win.set_position(tauri::Position::Physical(
                            tauri::PhysicalPosition {
                                x: pos.x,
                                y: clamped_phys_y,
                            },
                        ));
                    }
                }
            }
        }
    }
    Ok(())
}
