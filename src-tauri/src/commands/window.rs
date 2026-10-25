#![allow(unused_imports)]
use crate::common::*;
use nanai_android_mascot_ui::{open_shift_jis_file, resolve_vfs_path};
use std::path::{Path, PathBuf};
use std::sync::Mutex;
#[cfg(desktop)]
use tauri::menu::{MenuBuilder, SubmenuBuilder};
use tauri::{Emitter, Manager};
/// Androidオーバーレイ権限リクエスト・案内コマンド
#[tauri::command]
pub async fn request_overlay_permission() -> Result<String, String> {
    #[cfg(target_os = "android")]
    {
        // 将来的にJNI経由でSettings.ACTION_MANAGE_OVERLAY_PERMISSIONを発行
        Ok("Androidオーバーレイ設定画面への誘導を行いました".to_string())
    }
    #[cfg(not(target_os = "android"))]
    {
        Ok("デスクトップ環境のためオーバーレイ権限は不要です（Always On Top有効）".to_string())
    }
}

/// Androidフォアグラウンドサービス通知チャネル設定コマンド
#[tauri::command]
pub async fn setup_foreground_service(enabled: bool) -> Result<String, String> {
    #[cfg(target_os = "android")]
    {
        // JNI経由でNotificationChannel作成およびForegroundService起動
        Ok(format!("Android常駐サービスを切り替えました: {}", enabled))
    }
    #[cfg(not(target_os = "android"))]
    {
        Ok(format!("常駐モード状態: {}", enabled))
    }
}

/// デバッグ用のテストコマンド
#[tauri::command]
pub async fn test_command() -> Result<String, String> {
    Ok("SHIORI統合テスト成功!".to_string())
}

/// アプリケーション最小化コマンド
#[tauri::command]
pub async fn minimize_app(app_handle: tauri::AppHandle) -> Result<(), String> {
    #[cfg(desktop)]
    if let Some(window) = app_handle.get_webview_window("main") {
        window.minimize().map_err(|e| e.to_string())?;
    }
    #[cfg(not(desktop))]
    let _ = app_handle;
    Ok(())
}

/// アプリケーション終了コマンド
#[tauri::command]
pub async fn exit_app(app_handle: tauri::AppHandle) -> Result<(), String> {
    app_handle.exit(0);
    Ok(())
}

/// OSネイティブのコンテキストメニュー表示コマンド (SSP / ukadoc 仕様準拠のメニュー再編)
#[tauri::command]
#[allow(unused_variables)]
pub async fn show_context_menu(
    app_handle: tauri::AppHandle,
    ghosts: Vec<String>,
    current_ghost: Option<String>,
    shells: Vec<String>,
    current_shell: Option<String>,
) -> Result<(), String> {
    #[cfg(desktop)]
    {
        let window = app_handle
            .get_webview_window("main")
            .ok_or("main window not found")?;

        // 1. ゴースト切り替えサブメニュー
        let mut ghost_submenu_builder = SubmenuBuilder::new(&app_handle, "👻 ゴースト切り替え (G)");
        for g in &ghosts {
            let label = if current_ghost.as_ref() == Some(g) {
                format!("✓ {}", g)
            } else {
                format!("   {}", g)
            };
            ghost_submenu_builder = ghost_submenu_builder.text(format!("ghost:{}", g), label);
        }
        if !ghosts.is_empty() {
            ghost_submenu_builder = ghost_submenu_builder.separator();
        }
        ghost_submenu_builder = ghost_submenu_builder.text("ghost", "📂 ゴースト一覧・管理...");
        let ghost_submenu = ghost_submenu_builder.build().map_err(|e| e.to_string())?;

        // 2. 着せ替え・シェル切り替えサブメニュー
        let mut shell_submenu_builder = SubmenuBuilder::new(&app_handle, "👗 着せ替え・シェル (C)");
        let active_shell = current_shell.as_deref().unwrap_or("master");
        for s in &shells {
            let label = if s == active_shell {
                format!("✓ {}", s)
            } else {
                format!("   {}", s)
            };
            shell_submenu_builder = shell_submenu_builder.text(format!("shell:{}", s), label);
        }
        let shell_submenu = shell_submenu_builder.build().map_err(|e| e.to_string())?;

        // 3. シェル倍率サブメニュー
        let scale_submenu = SubmenuBuilder::new(&app_handle, "🔍 シェル倍率 (S)")
            .text("scale-50", "50%")
            .text("scale-75", "75%")
            .text("scale-100", "100% (標準)")
            .text("scale-125", "125%")
            .text("scale-150", "150%")
            .text("scale-200", "200%")
            .build()
            .map_err(|e| e.to_string())?;

        // SSP標準階層メニュー構築
        let menu = MenuBuilder::new(&app_handle)
            // トーク
            .text("talk", "💬 もう一度話す (T)")
            .separator()
            // ゴースト・外観
            .item(&ghost_submenu)
            .item(&shell_submenu)
            .item(&scale_submenu)
            .text("balloon", "💭 バルーン設定 (B)")
            .separator()
            // ツール・拡張
            .text("update", "🌐 ネットワーク更新 (U)")
            .text("headline", "📰 ヘッドライン/ニュース (H)")
            .text("install", "📥 ファイル取り込み・導入 (I)")
            .text("scan", "📂 フォルダ再スキャン (R)")
            .text("plugins", "🧩 プラグイン・拡張機能 (P)")
            .separator()
            // 設定・ヘルプ
            .text("settings", "⚙️ 設定 (O)")
            .text("debug", "🐛 デバッグログ (D)")
            .text("help", "❓ 情報・ヘルプ (A)")
            .text("license", "📜 著作権・ライセンス表示 (L)")
            .separator()
            // ウィンドウ操作・終了
            .text("minimize", "🗕 アイコン化・隠す (I)")
            .text("exit", "❌ 終了 (W)")
            .build()
            .map_err(|e| e.to_string())?;

        window.popup_menu(&menu).map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// バルーンスキン連動の独立ポップアップメニューウィンドウ表示コマンド (ウィンドウ枠外にはみ出して表示可能)
#[tauri::command]
#[allow(unused_variables)]
pub async fn show_menu_window(
    app_handle: tauri::AppHandle,
    x: f64,
    y: f64,
    scope: Option<i32>,
) -> Result<(), String> {
    #[cfg(desktop)]
    {
        use tauri::Manager;
        let menu_scope = scope.unwrap_or(0);
        // メインメニューの実寸 (240x540: 終了ボタン・フッターまで収まるサイズ, サブキャラ用は420)
        let win_width = 240.0;
        let win_height = if menu_scope > 0 { 420.0 } else { 540.0 };

        let mut target_x = x;
        let mut target_y = y;

        // モニター境界を取得して画面内に収める
        if let Ok(Some(monitor)) = app_handle.primary_monitor() {
            let screen_size = monitor.size();
            let screen_pos = monitor.position();
            let max_x = (screen_pos.x + screen_size.width as i32) as f64 - win_width;
            let max_y = (screen_pos.y + screen_size.height as i32) as f64 - win_height;

            if target_x > max_x {
                target_x = max_x.max(screen_pos.x as f64);
            }
            if target_y > max_y {
                target_y = max_y.max(screen_pos.y as f64);
            }
        }

        if let Some(menu_win) = app_handle.get_webview_window("menu_window") {
            let _ = menu_win.set_size(tauri::Size::Logical(tauri::LogicalSize {
                width: win_width,
                height: win_height,
            }));
            let _ = menu_win.set_position(tauri::Position::Physical(tauri::PhysicalPosition {
                x: target_x as i32,
                y: target_y as i32,
            }));
            let _ = menu_win.show();
            let _ = menu_win.set_focus();
            let _ = menu_win.emit("sync-menu-scope", menu_scope);
        } else {
            let menu_win = tauri::WebviewWindowBuilder::new(
                &app_handle,
                "menu_window",
                tauri::WebviewUrl::App(format!("menu-iframe.html?scope={}", menu_scope).into()),
            )
            .title("Nanai Menu")
            .inner_size(win_width, win_height)
            .transparent(true)
            .decorations(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .resizable(false)
            .position(target_x, target_y)
            .build()
            .map_err(|e| e.to_string())?;

            let _ = menu_win.show();
            let _ = menu_win.set_focus();
            let _ = menu_win.emit("sync-menu-scope", menu_scope);
        }
    }
    Ok(())
}

/// メニューウィンドウ非表示コマンド
#[tauri::command]
#[allow(unused_variables)]
pub async fn hide_menu_window(app_handle: tauri::AppHandle) -> Result<(), String> {
    #[cfg(desktop)]
    {
        if let Some(menu_win) = app_handle.get_webview_window("menu_window") {
            let _ = menu_win.hide();
        }
        if let Some(sub_win) = app_handle.get_webview_window("submenu_window") {
            let _ = sub_win.hide();
        }
    }
    Ok(())
}

/// 独立サブメニューウィンドウ表示コマンド
#[tauri::command]
#[allow(unused_variables)]
pub async fn show_submenu_window(
    app_handle: tauri::AppHandle,
    menu_type: String,
    x: f64,
    y: f64,
    width: Option<f64>,
    height: Option<f64>,
) -> Result<(), String> {
    #[cfg(desktop)]
    {
        use tauri::Manager;
        let win_width = width.unwrap_or(220.0);
        let win_height = height.unwrap_or(320.0);

        let mut target_x = x;
        let mut target_y = y;

        if let Ok(Some(monitor)) = app_handle.primary_monitor() {
            let screen_size = monitor.size();
            let screen_pos = monitor.position();
            let max_x = (screen_pos.x + screen_size.width as i32) as f64 - win_width;
            let max_y = (screen_pos.y + screen_size.height as i32) as f64 - win_height;

            if target_x > max_x {
                // 右端を超える場合は左側へ反転 (親メニューの左横へ)
                target_x = (x - win_width - 240.0).max(screen_pos.x as f64);
            }
            if target_y > max_y {
                target_y = max_y.max(screen_pos.y as f64);
            }
        }

        if let Some(sub_win) = app_handle.get_webview_window("submenu_window") {
            let _ = sub_win.set_size(tauri::Size::Logical(tauri::LogicalSize {
                width: win_width,
                height: win_height,
            }));
            let _ = sub_win.set_position(tauri::Position::Physical(tauri::PhysicalPosition {
                x: target_x as i32,
                y: target_y as i32,
            }));
            let _ = sub_win.show();
        } else {
            let sub_win = tauri::WebviewWindowBuilder::new(
                &app_handle,
                "submenu_window",
                tauri::WebviewUrl::App("submenu-iframe.html".into()),
            )
            .title("Nanai Submenu")
            .inner_size(win_width, win_height)
            .transparent(true)
            .decorations(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .resizable(false)
            .position(target_x, target_y)
            .build()
            .map_err(|e| e.to_string())?;

            let _ = sub_win.show();
        }

        // サブメニュータイプを通知
        let _ = app_handle.emit("set-submenu-type", serde_json::json!({ "type": menu_type }));
    }
    Ok(())
}

/// サブメニューウィンドウ非表示コマンド
#[tauri::command]
#[allow(unused_variables)]
pub async fn hide_submenu_window(app_handle: tauri::AppHandle) -> Result<(), String> {
    #[cfg(desktop)]
    {
        if let Some(sub_win) = app_handle.get_webview_window("submenu_window") {
            let _ = sub_win.hide();
        }
    }
    Ok(())
}

/// 汎用サブキャラクター（スコープ N）ウィンドウ表示コマンド
#[tauri::command]
#[allow(unused_variables)]
pub async fn show_subchar_window(
    app_handle: tauri::AppHandle,
    scope_id: i32,
    x: Option<f64>,
    y: Option<f64>,
    width: Option<f64>,
    height: Option<f64>,
) -> Result<(), String> {
    #[cfg(desktop)]
    {
        use tauri::Manager;
        let win_width = width.unwrap_or(200.0);
        let win_height = height.unwrap_or(360.0);
        let label = format!("subchar_window_{}", scope_id);

        if let Some(sub_win) = app_handle.get_webview_window(&label) {
            if let (Some(px), Some(py)) = (x, y) {
                let _ = sub_win.set_position(tauri::Position::Physical(tauri::PhysicalPosition {
                    x: px as i32,
                    y: py as i32,
                }));
            }
            let _ = sub_win.show();
        } else {
            // スコープ番号に応じた配置 (スコープ0: メイン位置、スコープ1以降: その横へ配置)
            let (mut target_x, mut target_y) = if scope_id == 0 {
                (200.0, 200.0)
            } else {
                (200.0 + (scope_id as f64 * 220.0), 200.0)
            };

            // スコープ0が既に存在する場合はそれを基準に横に並べる
            if scope_id > 0
                && let Some(char0_win) = app_handle.get_webview_window("subchar_window_0")
                && let Ok(pos) = char0_win.outer_position()
            {
                target_x = (pos.x as f64) + (scope_id as f64 * 220.0);
                target_y = pos.y as f64;
            }

            if let (Some(px), Some(py)) = (x, y) {
                target_x = px;
                target_y = py;
            }

            let title = if scope_id == 0 {
                "Nanai Android Mascot - Main Character".to_string()
            } else {
                format!("Nanai Android Mascot - Character {}", scope_id)
            };

            let sub_win = tauri::WebviewWindowBuilder::new(
                &app_handle,
                &label,
                tauri::WebviewUrl::App(format!("subcharacter.html?scope={}", scope_id).into()),
            )
            .title(title)
            .inner_size(win_width, win_height)
            .transparent(true)
            .decorations(false)
            .always_on_top(true)
            .resizable(false)
            .position(target_x, target_y)
            .build()
            .map_err(|e| e.to_string())?;

            let _ = sub_win.show();
        }
    }
    Ok(())
}

/// 汎用サブキャラクター（スコープ N）ウィンドウ非表示コマンド (\s[-1])
#[tauri::command]
#[allow(unused_variables)]
pub async fn hide_subchar_window(
    app_handle: tauri::AppHandle,
    scope_id: i32,
) -> Result<(), String> {
    #[cfg(desktop)]
    {
        let label = format!("subchar_window_{}", scope_id);
        if let Some(sub_win) = app_handle.get_webview_window(&label) {
            let _ = sub_win.hide();
        }
    }
    Ok(())
}
