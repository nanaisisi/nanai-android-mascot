//! 基本 SHIORI リクエスト / イベント / 通知 送信コマンド

use super::dispatch::{LogLevel, dispatch_request, log_level};
use crate::common::state::AppState;
use nanai_android_mascot_ui::shiori::{
    ShioriRequest, ShioriResponse, build_standard_capability_references,
};

/// SHIORIにリクエストを送信（SHIORI/3.0 プロトコル準拠）
#[tauri::command]
pub async fn send_shiori_request(
    state: tauri::State<'_, AppState>,
    request: String,
    ghost_id: Option<String>,
) -> Result<String, String> {
    let gid = ghost_id.unwrap_or_else(|| "main".to_string());

    let level = log_level();
    let noisy = request.contains("ID: OnSecondChange");
    if level >= LogLevel::Trace && !noisy {
        println!(
            "📤 [Rust] SHIORI request (ghost: {}):\n{}",
            gid,
            request.trim()
        );
    }

    let result = dispatch_request(&state, &request, &gid);

    match &result {
        Ok(res) => {
            if level >= LogLevel::Trace && !noisy {
                println!(
                    "📥 [Rust] SHIORI response (ghost: {}):\n{}",
                    gid,
                    res.trim()
                );
            }
        }
        Err(err) => {
            if level >= LogLevel::Info && !(noisy && level < LogLevel::Trace) {
                println!("❌ [Rust] SHIORI request failed (ghost: {}): {}", gid, err);
            }
        }
    }

    result
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SendShioriEventParams {
    event: String,
    references: Option<Vec<String>>,
    ghost_id: Option<String>,
}

impl SendShioriEventParams {
    pub fn event(&self) -> &str {
        &self.event
    }

    pub fn references(&self) -> Option<&Vec<String>> {
        self.references.as_ref()
    }

    pub fn ghost_id(&self) -> Option<&str> {
        self.ghost_id.as_deref()
    }
}

/// SHIORIにイベントを送信（簡易版・パラメータ指定対応）
#[tauri::command]
pub async fn send_shiori_event(
    state: tauri::State<'_, AppState>,
    params: SendShioriEventParams,
) -> Result<String, String> {
    let mut req = ShioriRequest::get(
        params.event(),
        &params.references().cloned().unwrap_or_default(),
    );
    req = req.with_sender("NanaiMascot");
    send_shiori_request(
        state,
        req.build(),
        params.ghost_id().map(ToString::to_string),
    )
    .await
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SendShioriNotifyParams {
    event: String,
    references: Option<Vec<String>>,
    ghost_id: Option<String>,
}

impl SendShioriNotifyParams {
    pub fn event(&self) -> &str {
        &self.event
    }

    pub fn references(&self) -> Option<&Vec<String>> {
        self.references.as_ref()
    }

    pub fn ghost_id(&self) -> Option<&str> {
        self.ghost_id.as_deref()
    }
}

/// SHIORIへ NOTIFY コマンドで情報を通知（UKADOC notify イベント群）
#[tauri::command]
pub async fn send_shiori_notify(
    state: tauri::State<'_, AppState>,
    params: SendShioriNotifyParams,
) -> Result<String, String> {
    let mut req = ShioriRequest::notify(
        params.event(),
        &params.references().cloned().unwrap_or_default(),
    );
    req = req.with_sender("NanaiMascot");
    send_shiori_request(
        state,
        req.build(),
        params.ghost_id().map(ToString::to_string),
    )
    .await
}

/// SHIORI へ UKADOC 準拠の capability Notify イベントを送信
#[allow(dead_code)]
#[tauri::command]
pub async fn send_shiori_capability(
    state: tauri::State<'_, AppState>,
    ghost_id: Option<String>,
) -> Result<String, String> {
    let refs = build_standard_capability_references();
    let mut req = ShioriRequest::capability(&refs);
    req = req.with_sender("NanaiMascot");
    send_shiori_request(state, req.build(), ghost_id).await
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SendShioriEventTypedParams {
    event: String,
    args: Option<Vec<String>>,
    ghost_id: Option<String>,
}

impl SendShioriEventTypedParams {
    pub fn event(&self) -> &str {
        &self.event
    }

    pub fn args(&self) -> Option<&Vec<String>> {
        self.args.as_ref()
    }

    pub fn ghost_id(&self) -> Option<&str> {
        self.ghost_id.as_deref()
    }
}

/// SHIORI イベントを送信し、解析済み `ShioriResponse` オブジェクトで返す
#[tauri::command]
pub async fn send_shiori_event_typed(
    state: tauri::State<'_, AppState>,
    params: SendShioriEventTypedParams,
) -> Result<ShioriResponse, String> {
    let event = params.event().to_string();
    let mut req = ShioriRequest::get(&event, &params.args().cloned().unwrap_or_default());
    req = req.with_sender("NanaiMascot");

    let gid = params.ghost_id().unwrap_or("main").to_string();
    let text = req.build();
    let raw = dispatch_request(&state, &text, &gid)?;
    let parsed = ShioriResponse::parse(&raw);
    if event != "OnSecondChange"
        && let Ok(ref res) = parsed
    {
        println!(
            "✨ SHIORI Event '{}' -> status={:?}, value='{}'",
            event,
            res.status(),
            res.value().unwrap_or("")
        );
    }
    parsed
}
