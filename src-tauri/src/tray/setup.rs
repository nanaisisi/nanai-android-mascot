//! システムトレイ初期化・イベントハンドラ構築

use super::logging::log_tray;
use crate::common::state::AppState;
use tauri::Manager;

#[cfg(not(target_os = "android"))]
use tauri::image::Image;
#[cfg(not(target_os = "android"))]
use tauri::tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconBuilder, TrayIconEvent};

#[cfg(not(target_os = "android"))]
pub struct TrayCallbacks {
    pub on_toggle_minimize: Box<dyn Fn(tauri::AppHandle, bool) + Send + Sync>,
    pub on_right_click: Box<dyn Fn(tauri::AppHandle, f64, f64) + Send + Sync>,
}

#[cfg(not(target_os = "android"))]
pub fn setup_tray(
    app: &tauri::App,
    callbacks: TrayCallbacks,
) -> Result<TrayIcon<tauri::Wry>, tauri::Error> {
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
                    if next_min {
                        log_tray("📉 トレイダブルクリック: 非表示化（アイコン化）を実行");
                    } else {
                        log_tray("📈 トレイダブルクリック: ディスプレイを復元 (Restore)");
                    }
                    (callbacks.on_toggle_minimize)(app_handle, next_min);
                }
                TrayIconEvent::Click { button, button_state: MouseButtonState::Up, rect, .. } => {
                    match button {
                        MouseButton::Right => {
                            log_tray("🖱️ システムトレイアイコンが右クリックされました -> カスタムメニュー表示 (show_menu_window)");
                            let app_handle = tray.app_handle().clone();
                            let px = match rect.position {
                                tauri::Position::Physical(p) => p.x as f64,
                                tauri::Position::Logical(l) => l.x,
                            };
                            let py = match rect.position {
                                tauri::Position::Physical(p) => p.y as f64,
                                tauri::Position::Logical(l) => l.y,
                            };
                            let ph = match rect.size {
                                tauri::Size::Physical(s) => s.height as f64,
                                tauri::Size::Logical(s) => s.height,
                            };
                            (callbacks.on_right_click)(app_handle, px, py + ph);
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
