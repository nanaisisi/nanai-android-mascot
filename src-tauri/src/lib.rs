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
                let _tray = TrayIconBuilder::new()
                    .icon(icon)
                    .on_tray_icon_event(move |tray, event| {
                        if let TrayIconEvent::Click {
                            button: tauri::tray::MouseButton::Left,
                            button_state: tauri::tray::MouseButtonState::Up,
                            ..
                        }
                        | TrayIconEvent::DoubleClick { .. } = event
                        {
                            let app_handle = tray.app_handle().clone();
                            tauri::async_runtime::spawn(async move {
                                let (x, y) = if let Ok(Some(monitor)) = app_handle.primary_monitor()
                                {
                                    let size = monitor.size();
                                    let pos = monitor.position();
                                    (
                                        (pos.x + size.width as i32) as f64 - 260.0,
                                        (pos.y + size.height as i32) as f64 - 560.0,
                                    )
                                } else {
                                    (100.0, 100.0)
                                };
                                let _ =
                                    commands::window::show_menu_window(app_handle, x, y, Some(0))
                                        .await;
                            });
                        }
                    })
                    .build(app)?;
                let menu = MenuBuilder::new(app)
                    .text("open_menu", "メニューを開く")
                    .text("close", "終了")
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
        } else if id == "open" || id == "open_menu" {
            let app_h = app_handle.clone();
            tauri::async_runtime::spawn(async move {
                let (x, y) = if let Ok(Some(monitor)) = app_h.primary_monitor() {
                    let size = monitor.size();
                    let pos = monitor.position();
                    (
                        (pos.x + size.width as i32) as f64 - 260.0,
                        (pos.y + size.height as i32) as f64 - 560.0,
                    )
                } else {
                    (100.0, 100.0)
                };
                let _ = commands::window::show_menu_window(app_h, x, y, Some(0)).await;
            });
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
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::file::open_file,
            commands::config::get_app_config,
            commands::config::record_ghost_loaded,
            commands::file::add_to_recent_files,
            commands::file::get_recent_files,
            commands::shell::shell_manifest,
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
            commands::window::show_balloon_window,
            commands::window::hide_balloon_window,
            commands::install::pick_and_install_ghost_archive,
            commands::install::install_ghost_archive,
            commands::install::install_ghost_archive_bytes,
            commands::file::load_surface_image,
            commands::file::load_surface_pna,
            commands::update::check_ghost_update,
            commands::update::execute_ghost_update
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
