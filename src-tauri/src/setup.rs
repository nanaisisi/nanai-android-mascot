//! Tauri アプリケーション起動時初期化 (setup hook) 処理

use crate::commands;
use crate::common::state::AppState;
use crate::jumplist;
use crate::shiori;
#[cfg(not(target_os = "android"))]
use crate::tray;
use tauri::Manager;

pub fn setup_app(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    std::println!(
        "🟢 Tauri .setup() 呼び出し開始！ OS: {}",
        std::env::consts::OS
    );

    shiori::fmo::acquire_base_ware_mutexes();
    let _ = jumplist::setup_taskbar_jumplist(app);

    #[cfg(not(target_os = "android"))]
    {
        std::println!("🟢 not(target_os = \"android\") ブロック突入");
        let tray = tray::setup_tray(app)?;
        let state = app.state::<AppState>();
        *state.tray_icon.lock() = Some(tray.clone());
        app.manage(tray);
        std::println!("🟢 システムトレイのセットアップが完了しました");

        // バルーン・メニュー等の補助ウィンドウを先行キャッシュ（起動時のもたつき解消）およびキャラクターウィンドウの自動表示
        let app_handle_preload = app.handle().clone();
        tauri::async_runtime::block_on(async move {
            let _ = commands::window::preload_auxiliary_windows(app_handle_preload.clone()).await;
            let _ = commands::window::show_character_window(
                app_handle_preload.clone(),
                commands::window::character_window::ShowCharacterWindowParams::new(
                    0, None, None, None, None,
                ),
            )
            .await;
            let _ = commands::window::show_character_window(
                app_handle_preload.clone(),
                commands::window::character_window::ShowCharacterWindowParams::new(
                    1, None, None, None, None,
                ),
            )
            .await;
        });
    }

    #[cfg(target_os = "android")]
    let _ = app;

    Ok(())
}
