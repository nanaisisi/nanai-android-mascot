//! SSTP 中断 (Break) およびブラックリスト登録イベント通知モジュール

use crate::sstp::types::{SstpBlacklistingEvent, SstpBreakEvent};
use nanai_android_mascot_ui::sstp::SstpEventBuilder;
use std::collections::HashMap;
use tauri::Emitter;

/// SSTP 中断 (Break) を通知し OnSSTPBreak イベントペイロードを構築する
#[tauri::command]
pub async fn notify_sstp_break(
    event: SstpBreakEvent,
    app_handle: tauri::AppHandle,
) -> Result<HashMap<String, String>, String> {
    let params =
        SstpEventBuilder::build_on_sstp_break(&event.script, event.scope, event.break_position);
    app_handle
        .emit("sstp-break", &params)
        .map_err(|e| e.to_string())?;
    Ok(params)
}

/// クライアントのブラックリスト登録を通知し OnSSTPBlacklisting イベントペイロードを構築する
#[tauri::command]
pub async fn notify_sstp_blacklisting(
    event: SstpBlacklistingEvent,
    app_handle: tauri::AppHandle,
) -> Result<HashMap<String, String>, String> {
    let params = SstpEventBuilder::build_on_sstp_blacklisting(&event.client_ip);
    app_handle
        .emit("sstp-blacklisting", &params)
        .map_err(|e| e.to_string())?;
    Ok(params)
}
