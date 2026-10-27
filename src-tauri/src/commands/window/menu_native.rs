use tauri::Manager;
#[cfg(desktop)]
use tauri::menu::{MenuBuilder, SubmenuBuilder};

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
            .text("ghost-info", "👻 ゴースト情報")
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
