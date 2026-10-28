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
            .text("talk", "💬 もう一度話す (A)")
            .separator()
            // リンク・更新
            .text("recommend", "🔗 おすすめ (R)")
            .text("portal", "🌐 ポータルサイト (T)")
            .text("update", "🔄 ネットワーク更新 (U)")
            .text("uninstall", "🗑️ アンインストール (D)")
            .text("headline", "📰 RSS/ヘッドライン (H)")
            .text("plugins", "🧩 プラグイン (P)")
            .text("biff", "📬 メールチェック (M)")
            .separator()
            // ゴースト・外観
            .item(&scale_submenu)
            .text("tools", "🛠️ 機能 (F)")
            .text("settings", "⚙️ 設定 (O)")
            .separator()
            .item(&ghost_submenu)
            .item(&shell_submenu)
            .text("balloon", "💭 バルーン (B)")
            .separator()
            // 情報・ヘルプ
            .text("help", "ℹ️ 本体情報 (A)")
            .text("ghost-info", "👻 ゴースト情報 (G)")
            .text("license", "📜 著作権・ライセンス表示 (L)")
            .separator()
            // ウィンドウ操作・終了
            .text("minimize", "🗕 アイコン化 (I)")
            .text("exit", "✖ 終了 (W)")
            .text("close-all", "❌ 全て終了 (X)")
            .build()
            .map_err(|e| e.to_string())?;

        window.popup_menu(&menu).map_err(|e| e.to_string())?;
    }
    Ok(())
}
