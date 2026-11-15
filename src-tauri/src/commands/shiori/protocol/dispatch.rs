//! SHIORI エンジンへのリクエスト配信およびログ出力ヘルパー

use crate::common::state::AppState;

#[derive(PartialEq, PartialOrd, Clone, Copy)]
pub enum LogLevel {
    Off,
    Info,
    Trace,
}

/// 開発ビルドでのみ NANAI_LOG を参照する。リリースビルドは常に Off。
pub fn log_level() -> LogLevel {
    if !cfg!(debug_assertions) {
        return LogLevel::Off;
    }
    match std::env::var("NANAI_LOG").as_deref() {
        Ok("off") => LogLevel::Off,
        Ok("trace") => LogLevel::Trace,
        _ => LogLevel::Info,
    }
}

/// エンジンへのリクエスト委譲（main / 個別ゴースト共通）
pub fn dispatch_request(
    state: &tauri::State<'_, AppState>,
    request: &str,
    ghost_id: &str,
) -> Result<String, String> {
    if ghost_id != "main" {
        let engines = state.ghost_engines.lock();
        if let Some(engine) = engines.get(ghost_id) {
            return engine.request(request);
        }
        return Err("Ghost engine not found".to_string());
    }
    // デフォルト/メインのネイティブSHIORIエンジンへ委譲
    let engine_lock = state.shiori_engine.lock();
    if let Some(ref engine) = *engine_lock {
        engine.request(request)
    } else {
        Err("No active SHIORI engine loaded".to_string())
    }
}
