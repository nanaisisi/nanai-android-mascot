// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::Emitter;
use tauri::Manager;

// Desktop専用の機能
#[cfg(desktop)]
use tauri::image::Image;
#[cfg(desktop)]
use tauri::menu::MenuBuilder;
#[cfg(desktop)]
use tauri::tray::{TrayIconBuilder, TrayIconEvent};

mod common;
mod config_cmds;
mod file_cmds;
mod ghost_scan;
mod install_cmds;
mod shiori_cmds;
mod shiori_dynamic;
mod window_cmds;

use common::*;

// ========================================

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .setup(|app| {
            #[cfg(desktop)]
            {
                let icon = app
                    .default_window_icon()
                    .cloned()
                    .unwrap_or_else(|| Image::new_owned(vec![0, 0, 0, 0], 1, 1));
                let app_handle = app.app_handle().clone();
                let _tray = TrayIconBuilder::new()
                    .icon(icon)
                    .on_tray_icon_event(move |_tray, event| {
                        if let TrayIconEvent::Click { .. } = event {
                            if let Some(window) = app_handle.get_webview_window("main") {
                                if let Err(e) =
                                    window.emit("error", "Failed to show window".to_string())
                                {
                                    eprintln!("emit failed: {e}");
                                }
                            } else {
                                let msg = "main window not found".to_string();
                                eprintln!("{msg}");
                                emit_error_to_all(&app_handle, msg.clone());
                            }
                        }
                    })
                    .build(app)?;
                let menu = MenuBuilder::new(app)
                    .text("open", "Open")
                    .text("close", "Close")
                    .build()?;

                app.set_menu(menu)?;
            }
            #[cfg(not(desktop))]
            let _ = app;
            Ok(())
        })
        .manage(AppState::new());

    #[cfg(desktop)]
    let builder = builder.on_menu_event(move |app_handle, event| {
        let id = event.id().as_ref();
        if let Some(ghost_name) = id.strip_prefix("ghost:") {
            let _ = app_handle.emit(
                "native-menu-action",
                serde_json::json!({
                    "action": "switch-to-ghost",
                    "payload": ghost_name
                }),
            );
        } else if let Some(shell_name) = id.strip_prefix("shell:") {
            let _ = app_handle.emit(
                "native-menu-action",
                serde_json::json!({
                    "action": "switch-to-shell",
                    "payload": shell_name
                }),
            );
        } else if id == "open" {
            if let Some(window) = app_handle.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        } else if id == "close" || id == "exit" {
            app_handle.exit(0);
        } else {
            let _ = app_handle.emit(
                "native-menu-action",
                serde_json::json!({
                    "action": id
                }),
            );
        }
    });

    builder
        .on_window_event(|window, event| {
            if (window.label() == "menu_window" || window.label() == "submenu_window")
                && let tauri::WindowEvent::Focused(false) = event
            {
                let _ = window.hide();
            }
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            file_cmds::open_file,
            config_cmds::get_app_config,
            config_cmds::record_ghost_loaded,
            file_cmds::add_to_recent_files,
            file_cmds::get_recent_files,
            ghost_scan::scan_ghost_directory,
            shiori_cmds::scan_ghosts,
            shiori_cmds::load_ghost,
            shiori_cmds::send_shiori_request,
            shiori_cmds::send_shiori_event,
            shiori_cmds::on_mouse_click,
            shiori_cmds::on_second_change,
            shiori_cmds::get_current_ghost,
            shiori_cmds::get_all_ghosts,
            shiori_cmds::get_shiori_status,
            shiori_cmds::unload_current_ghost,
            window_cmds::request_overlay_permission,
            window_cmds::setup_foreground_service,
            window_cmds::test_command,
            window_cmds::minimize_app,
            window_cmds::exit_app,
            window_cmds::show_context_menu,
            window_cmds::show_menu_window,
            window_cmds::hide_menu_window,
            window_cmds::show_submenu_window,
            window_cmds::hide_submenu_window,
            install_cmds::install_ghost_archive,
            install_cmds::install_ghost_archive_bytes,
            file_cmds::load_surface_image
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
