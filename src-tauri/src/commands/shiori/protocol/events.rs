//! 特殊イベント (MouseClick, SecondChange, OnTranslate, GhostCall) コマンド

use super::dispatch::dispatch_request;
use crate::common::state::AppState;
use crate::ui_adapter::shiori::{ShioriRequest, ShioriResponse};

/// マウスクリックイベントを送信（簡易版）
#[tauri::command]
#[specta::specta]
pub async fn on_mouse_click() -> Result<String, String> {
    println!("🖱️ Mouse click event");
    Ok("Mouse clicked".to_string())
}

/// 秒数変化イベントを送信（簡易版）
#[tauri::command]
#[specta::specta]
pub async fn on_second_change() -> Result<String, String> {
    Ok("Second changed".to_string())
}

/// SHIORI へ OnTranslate イベントを送信し、ゴースト側で翻訳されたさくらスクリプトを取得する (UKADOC 規格準拠)
#[tauri::command]
pub async fn send_on_translate(
    state: tauri::State<'_, AppState>,
    script: String,
    ghost_id: Option<String>,
) -> Result<String, String> {
    let mut req = ShioriRequest::get("OnTranslate", std::slice::from_ref(&script));
    req = req.with_sender("NanaiMascot");
    let gid = ghost_id.unwrap_or_else(|| "main".to_string());

    match dispatch_request(&state, &req.build(), &gid) {
        Ok(raw) => {
            let parsed = ShioriResponse::parse(&raw);
            if let Ok(res) = parsed
                && let Some(val) = res.value()
            {
                let trimmed = val.trim();
                if !trimmed.is_empty() {
                    return Ok(trimmed.to_string());
                }
            }
            Ok(script)
        }
        Err(_) => Ok(script),
    }
}

/// Windows 専用 `makoto.dll` をロードし、MAKOTO/2.0 プロトコルでさくらスクリプトを翻訳する
#[tauri::command]
pub async fn execute_makoto_translate(dll_path: String, script: String) -> Result<String, String> {
    crate::shiori::makoto::execute_makoto_dll(std::path::Path::new(&dll_path), &script)
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SendGhostCallEventParams {
    event: String,
    target_ghost_name: String,
    ghost_id: Option<String>,
}

impl SendGhostCallEventParams {
    pub fn event(&self) -> &str {
        &self.event
    }

    pub fn target_ghost_name(&self) -> &str {
        &self.target_ghost_name
    }

    pub fn ghost_id(&self) -> Option<&str> {
        self.ghost_id.as_deref()
    }
}

/// ゴースト間呼び出し/切り替え関連のイベントを送信する (UKADOC 規格準拠)
#[tauri::command]
pub async fn send_ghost_call_event(
    state: tauri::State<'_, AppState>,
    params: SendGhostCallEventParams,
) -> Result<String, String> {
    let mut req = ShioriRequest::get(params.event(), &[params.target_ghost_name().to_string()]);
    req = req.with_sender("NanaiMascot");
    let gid = params.ghost_id().unwrap_or("main");
    dispatch_request(&state, &req.build(), gid)
}
