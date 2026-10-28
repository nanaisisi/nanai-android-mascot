//! SSTP (SakuraScript Transfer Protocol) 受信・処理システム (UKADOC 規格準拠)
//! 外部アプリケーションや他のゴーストからのさくらスクリプト送信（SEND SSTP/1.1）を受け付ける

use serde::{Deserialize, Serialize};
use tauri::Emitter;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SstpRequest {
    pub sender: String,
    pub script: String,
    pub hwnd: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SstpResponse {
    pub status: String,
    pub value: String,
}

/// 外部からの SSTP リクエストを受信し、ゴーストにさくらスクリプトを実行させる Tauri コマンド
#[tauri::command]
pub async fn send_sstp_request(
    request: SstpRequest,
    app_handle: tauri::AppHandle,
) -> Result<SstpResponse, String> {
    println!(
        "📨 SSTP RECEIVED: sender={}, script={}",
        request.sender, request.script
    );

    // フロントエンドのゴーストディスプレイへさくらスクリプト実行イベントを送信
    app_handle
        .emit("sstp-execute-script", &request.script)
        .map_err(|e| e.to_string())?;

    Ok(SstpResponse {
        status: "200 OK".to_string(),
        value: "Script accepted and executed".to_string(),
    })
}
