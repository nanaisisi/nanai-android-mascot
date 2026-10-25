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

mod commands;
mod common;
mod ghost;
mod shiori;

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
            if let tauri::WindowEvent::Focused(false) = event {
                let label = window.label();
                if label == "menu_window" || label == "submenu_window" {
                    let app = window.app_handle();
                    let menu_focused = app
                        .get_webview_window("menu_window")
                        .map(|w| w.is_focused().unwrap_or(false))
                        .unwrap_or(false);
                    let sub_focused = app
                        .get_webview_window("submenu_window")
                        .map(|w| w.is_focused().unwrap_or(false))
                        .unwrap_or(false);

                    // メニューとサブメニューの双方がフォーカスを失った場合のみ非表示化
                    if !menu_focused && !sub_focused {
                        if let Some(m) = app.get_webview_window("menu_window") {
                            let _ = m.hide();
                        }
                        if let Some(s) = app.get_webview_window("submenu_window") {
                            let _ = s.hide();
                        }
                    }
                }
            }
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::file::open_file,
            commands::config::get_app_config,
            commands::config::record_ghost_loaded,
            commands::file::add_to_recent_files,
            commands::file::get_recent_files,
            ghost::scan::scan_ghost_directory,
            commands::shiori::scan_ghosts,
            commands::shiori::load_ghost,
            commands::shiori::send_shiori_request,
            commands::shiori::send_shiori_event,
            commands::shiori::on_mouse_click,
            commands::shiori::on_second_change,
            commands::shiori::get_current_ghost,
            commands::shiori::get_all_ghosts,
            commands::shiori::get_shiori_status,
            commands::shiori::unload_current_ghost,
            commands::shiori::spawn_ghost,
            commands::shiori::close_ghost,
            commands::window::request_overlay_permission,
            commands::window::setup_foreground_service,
            commands::window::test_command,
            commands::window::minimize_app,
            commands::window::exit_app,
            commands::window::show_context_menu,
            commands::window::show_menu_window,
            commands::window::hide_menu_window,
            commands::window::show_submenu_window,
            commands::window::hide_submenu_window,
            commands::window::show_subchar_window,
            commands::window::hide_subchar_window,
            commands::install::install_ghost_archive,
            commands::install::install_ghost_archive_bytes,
            commands::file::load_surface_image,
            commands::update::check_ghost_update,
            commands::update::execute_ghost_update
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
