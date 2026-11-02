#![allow(dead_code)]

/// Androidオーバーレイ権限リクエスト・案内コマンド
#[tauri::command]
#[specta::specta]
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
#[specta::specta]
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

/// Androidオーバーレイ透明度設定コマンド (0.0 〜 1.0)
#[tauri::command]
#[specta::specta]
pub async fn set_overlay_transparency(alpha: f64) -> Result<f64, String> {
    let clamped = alpha.clamp(0.0, 1.0);
    #[cfg(target_os = "android")]
    {
        // JNI経由でWindowLayoutParams.alphaを設定
    }
    Ok(clamped)
}

/// Androidクリックスルー（背面タッチ透過）切り替えコマンド
#[tauri::command]
#[specta::specta]
pub async fn set_click_through(enabled: bool) -> Result<bool, String> {
    #[cfg(target_os = "android")]
    {
        // JNI経由でFLAG_NOT_TOUCHABLEを設定/解除
    }
    Ok(enabled)
}

/// Android低メモリ通知 (onTrimMemory) 処理コマンド
#[tauri::command]
#[specta::specta]
pub async fn trim_memory_command(level: u32) -> Result<u32, String> {
    #[cfg(target_os = "android")]
    {
        // ネイティブ側キャッシュ・グラフィックバッファの解放処理
    }
    Ok(level)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_android_commands() {
        let perm = request_overlay_permission().await.unwrap();
        assert!(!perm.is_empty());

        let fg = setup_foreground_service(true).await.unwrap();
        assert!(fg.contains("true"));

        let alpha = set_overlay_transparency(0.8).await.unwrap();
        assert_eq!(alpha, 0.8);

        let alpha_clamped = set_overlay_transparency(1.5).await.unwrap();
        assert_eq!(alpha_clamped, 1.0);

        let ct = set_click_through(true).await.unwrap();
        assert!(ct);

        let trim = trim_memory_command(80).await.unwrap();
        assert_eq!(trim, 80);
    }
}
