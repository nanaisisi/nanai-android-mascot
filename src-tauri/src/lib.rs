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

                // バルーン・メニュー等の補助ウィンドウを先行キャッシュ（起動時のもたつき解消）
                let app_handle_preload = app.handle().clone();
                tauri::async_runtime::spawn(async move {
                    let _ = commands::window::preload_auxiliary_windows(app_handle_preload).await;
                });
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
                let label = window.label().to_string();
                if label == "menu_window" || label == "submenu_window" {
                    let app = window.app_handle().clone();
                    tauri::async_runtime::spawn_blocking(move || {
                        // フォーカス遷移中の瞬断による誤非表示を防ぐため 150ms 待機
                        std::thread::sleep(std::time::Duration::from_millis(150));
                        let menu_focused = app
                            .get_webview_window("menu_window")
                            .map(|w| w.is_focused().unwrap_or(false))
                            .unwrap_or(false);
                        let sub_focused = app
                            .get_webview_window("submenu_window")
                            .map(|w| w.is_focused().unwrap_or(false))
                            .unwrap_or(false);

                        // メニューとサブメニューの双方が依然フォーカスを持っていない場合のみ非表示化
                        let state = app.state::<crate::common::AppState>();
                        let is_dialog_open = *state.is_dialog_open.lock();

                        if !menu_focused && !sub_focused && !is_dialog_open {
                            if let Some(m) = app.get_webview_window("menu_window")
                                && m.is_visible().unwrap_or(false)
                            {
                                let _ = m.hide();
                            }
                            if let Some(s) = app.get_webview_window("submenu_window")
                                && s.is_visible().unwrap_or(false)
                            {
                                let _ = s.hide();
                            }
                        }
                    });
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
            commands::file::open_ghost_directory,
            commands::shell::shell_manifest,
            commands::shell::parse_sakura_script,
            commands::shell::parse_surfaces_text,
            commands::shell::animation_timeline,
            commands::shell::scan_balloons,
            commands::shell::balloon_manifest,
            commands::shell::load_balloon_image,
            commands::shell::uninstall_ghost,
            commands::shell::surface_composition_plan,
            ghost::scan::scan_ghost_directory,
            commands::shiori::scan_ghosts,
            commands::shiori::load_ghost,
            commands::shiori::send_shiori_request,
            commands::shiori::send_shiori_event,
            commands::shiori::send_shiori_notify,
            commands::shiori::send_shiori_event_typed,
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
            commands::window::preload_auxiliary_windows,
            commands::window::show_loading_banner_window,
            commands::window::hide_loading_banner_window,
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
