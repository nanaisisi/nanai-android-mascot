//! システムトレイ初期化・イベントハンドラ構築

use super::logging::log_tray;
use crate::common::state::AppState;
use tauri::Manager;

#[cfg(not(target_os = "android"))]
use tauri::image::Image;
#[cfg(not(target_os = "android"))]
use tauri::tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconBuilder, TrayIconEvent};

#[cfg(not(target_os = "android"))]
pub fn setup_tray(app: &tauri::App) -> Result<TrayIcon<tauri::Wry>, tauri::Error> {
    log_tray("🟢 setup_tray 開始...");

    let icon = app.default_window_icon().cloned().unwrap_or_else(|| {
        log_tray(
            "⚠️ default_window_icon が取得できなかったため、32x32赤色フォールバックを使用します",
        );
        Image::new_owned(vec![255u8; 32 * 32 * 4], 32, 32)
    });

    let tray = TrayIconBuilder::with_id("main-tray")
        .icon(icon)
        .tooltip("Nanai Android Mascot")
        .show_menu_on_left_click(false)
        .on_tray_icon_event(move |tray, event| {
            match event {
                TrayIconEvent::DoubleClick { .. } => {
                    let app_handle = tray.app_handle().clone();
                    let state = app_handle.state::<AppState>();
                    let mut is_min = state.is_minimized.lock();
                    let next_min = !*is_min;
                    *is_min = next_min;
                    drop(is_min);

                    log_tray(&format!("🖱️⚙️ システムトレイアイコンがダブルクリックされました -> トグル切替 (next_min={})", next_min));
                    tauri::async_runtime::spawn(async move {
                        let _ = crate::commands::window::hide_menu_window(app_handle.clone()).await;
                        let _ = crate::commands::window::hide_submenu_window(app_handle.clone()).await;
                        if next_min {
                            log_tray("📉 トレイダブルクリック: 非表示化（アイコン化）を実行");
                            if let Some(win0) = app_handle.get_webview_window("subchar_window_0") {
                                let _ = win0.hide();
                            }
                            if let Some(win1) = app_handle.get_webview_window("subchar_window_1") {
                                let _ = win1.hide();
                            }
                        } else {
                            log_tray("📈 トレイダブルクリック: ディスプレイを復元 (Restore)");
                            let _ = crate::commands::window::show_character_window(
                                app_handle.clone(),
                                crate::commands::window::character_window::ShowCharacterWindowParams::new(
                                    0, None, None, None, None,
                                ),
                            )
                            .await;
                            let _ = crate::commands::window::show_character_window(
                                app_handle.clone(),
                                crate::commands::window::character_window::ShowCharacterWindowParams::new(
                                    1, None, None, None, None,
                                ),
                            )
                            .await;
                        }
                    });
                }
                TrayIconEvent::Click { button, button_state: MouseButtonState::Up, rect, .. } => {
                    match button {
                        MouseButton::Right => {
                            log_tray("🖱️ システムトレイアイコンが右クリックされました -> カスタムメニュー表示 (show_menu_window)");
                            let app_handle = tray.app_handle().clone();
                            let r = rect;
                            tauri::async_runtime::spawn(async move {
                                let px = match r.position {
                                    tauri::Position::Physical(p) => p.x as f64,
                                    tauri::Position::Logical(l) => l.x,
                                };
                                let py = match r.position {
                                    tauri::Position::Physical(p) => p.y as f64,
                                    tauri::Position::Logical(l) => l.y,
                                };
                                let ph = match r.size {
                                    tauri::Size::Physical(s) => s.height as f64,
                                    tauri::Size::Logical(s) => s.height,
                                };
                                let x = px;
                                let y = py + ph;
                                let _ = crate::commands::window::show_menu_window(
                                    app_handle,
                                    crate::commands::window::menu_window::ShowMenuWindowParams::new(
                                        x,
                                        y,
                                        Some(0),
                                    ),
                                )
                                .await;
                            });
                        }
                        MouseButton::Left => {
                            log_tray("🖱️ システムトレイアイコンの左クリックは無効化されています");
                        }
                        _ => {}
                    }
                }
                _ => {}
            }
        })
        .build(app);

    match &tray {
        Ok(_) => log_tray("🟢 setup_tray 完了（トレイ登録成功）"),
        Err(e) => log_tray(&format!("❌ エラー: トレイ登録失敗: {:?}", e)),
    }

    tray
}

#[cfg(target_os = "android")]
pub fn setup_tray(_app: &tauri::App) -> Result<(), ()> {
    Ok(())
}
