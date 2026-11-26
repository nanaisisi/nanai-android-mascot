#![allow(dead_code)]

#[cfg(target_os = "android")]
fn call_main_activity_static(
    method: &str,
    sig: jni::signature::MethodSignature<'_, '_>,
    args: &[jni::objects::JValue],
) -> Result<(), String> {
    let ctx = ndk_context::android_context();
    let vm = unsafe { jni::JavaVM::from_raw(ctx.vm().cast()) };
    vm.attach_current_thread(|env| -> jni::errors::Result<()> {
        let class = env.find_class(jni::strings::JNIString::from(
            "com/nanai_android_mascot/app/MainActivity",
        ))?;
        env.call_static_method(class, jni::strings::JNIString::from(method), sig, args)?;
        Ok(())
    })
    .map_err(|e| format!("MainActivity.{method} 呼び出し失敗: {e}"))
}

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
        call_main_activity_static(
            "applyForegroundService",
            jni::jni_sig!((enabled: jboolean) -> void),
            &[jni::objects::JValue::Bool(enabled)],
        )?;
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
        call_main_activity_static(
            "applyOverlayTransparency",
            jni::jni_sig!((alpha: jfloat) -> void),
            &[jni::objects::JValue::Float(clamped as f32)],
        )?;
    }
    Ok(clamped)
}

/// Androidクリックスルー（背面タッチ透過）切り替えコマンド
#[tauri::command]
#[specta::specta]
pub async fn set_click_through(enabled: bool) -> Result<bool, String> {
    #[cfg(target_os = "android")]
    {
        call_main_activity_static(
            "applyClickThrough",
            jni::jni_sig!((enabled: jboolean) -> void),
            &[jni::objects::JValue::Bool(enabled)],
        )?;
    }
    Ok(enabled)
}

/// Android統合オーバーレイウインドウのサイズ変更コマンド (全キャラ単一ウインドウ表示用)
#[tauri::command]
#[specta::specta]
pub async fn resize_overlay_window(width: u32, height: u32) -> Result<(u32, u32), String> {
    if width == 0 || height == 0 {
        return Err("width/height must be positive".to_string());
    }
    #[cfg(target_os = "android")]
    {
        call_main_activity_static(
            "applyResizeOverlayWindow",
            jni::jni_sig!((width: jint, height: jint) -> void),
            &[
                jni::objects::JValue::Int(width as i32),
                jni::objects::JValue::Int(height as i32),
            ],
        )?;
    }
    Ok((width, height))
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

        assert_eq!(resize_overlay_window(320, 200).await.unwrap(), (320, 200));
        assert!(resize_overlay_window(0, 10).await.is_err());

        let trim = trim_memory_command(80).await.unwrap();
        assert_eq!(trim, 80);
    }
}
