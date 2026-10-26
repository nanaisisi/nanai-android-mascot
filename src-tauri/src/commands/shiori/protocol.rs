use crate::common::*;

/// SHIORIにリクエストを送信（SHIORI/3.0 プロトコル準拠）
#[tauri::command]
pub async fn send_shiori_request(
    state: tauri::State<'_, AppState>,
    request: String,
    ghost_id: Option<String>,
) -> Result<String, String> {
    let gid = ghost_id.unwrap_or_else(|| "main".to_string());

    if gid != "main" {
        let engines = state.ghost_engines.lock();
        if let Some(engine) = engines.get(&gid) {
            return engine.request(&request);
        }
    }

    // デフォルト/メインのネイティブSHIORIエンジンへ委譲
    let engine_lock = state.shiori_engine.lock();

    if let Some(ref engine) = *engine_lock {
        engine.request(&request)
    } else {
        Err("No active SHIORI engine loaded".to_string())
    }
}

/// SHIORIにイベントを送信（簡易版・パラメータ指定対応）
#[tauri::command]
pub async fn send_shiori_event(
    state: tauri::State<'_, AppState>,
    event: String,
    references: Option<Vec<String>>,
    ghost_id: Option<String>,
) -> Result<String, String> {
    let mut req = format!(
        "GET SHIORI/3.0\r\nID: {}\r\nSender: NanaiMascot\r\nCharset: UTF-8\r\n",
        event
    );
    if let Some(refs) = references {
        for (i, ref_val) in refs.iter().enumerate() {
            req.push_str(&format!("Reference{}: {}\r\n", i, ref_val));
        }
    }
    req.push_str("\r\n");
    send_shiori_request(state, req, ghost_id).await
}

/// マウスクリックイベントを送信（簡易版）
#[tauri::command]
pub async fn on_mouse_click() -> Result<String, String> {
    println!("🖱️ Mouse click event");
    Ok("Mouse clicked".to_string())
}

/// 秒数変化イベントを送信（簡易版）
#[tauri::command]
pub async fn on_second_change() -> Result<String, String> {
    // 無音で実行
    Ok("Second changed".to_string())
}
