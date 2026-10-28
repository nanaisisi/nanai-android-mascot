use crate::common::*;
use nanai_android_mascot_ui::{ShioriRequest, ShioriResponse};

#[derive(PartialEq, PartialOrd, Clone, Copy)]
enum LogLevel {
    Off,
    Info,
    Trace,
}

/// 開発ビルドでのみ NANAI_LOG を参照する。リリースビルドは常に Off。
fn log_level() -> LogLevel {
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
///
/// `crates/ui` の ukadoc-spec 準拠 `ShioriRequest` でビルドしたテキストを
/// そのまま SHIORI DLL へ渡す。
fn dispatch_request(
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

/// SHIORIにリクエストを送信（SHIORI/3.0 プロトコル準拠）
#[tauri::command]
pub async fn send_shiori_request(
    state: tauri::State<'_, AppState>,
    request: String,
    ghost_id: Option<String>,
) -> Result<String, String> {
    let gid = ghost_id.unwrap_or_else(|| "main".to_string());

    // ログ階層: NANAI_LOG=off|info|trace（開発ビルドのみ有効。リリースでは常に無効）
    // 既定は info（失敗のみ出力）、trace で全リクエスト/レスポンス、毎秒の OnSecondChange は NANAI_LOG=trace のときのみ
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

/// SHIORIにイベントを送信（簡易版・パラメータ指定対応）
///
/// リクエスト構築は `nanai_android_mascot_ui` の ukadoc-spec 準拠
/// `ShioriRequest` モデル（GET / Sender / Charset / ID / Reference0..N）に一本化。
#[tauri::command]
pub async fn send_shiori_event(
    state: tauri::State<'_, AppState>,
    event: String,
    references: Option<Vec<String>>,
    ghost_id: Option<String>,
) -> Result<String, String> {
    let mut req = ShioriRequest::get(&event, &references.unwrap_or_default());
    req.sender = "NanaiMascot".to_string();
    send_shiori_request(state, req.build(), ghost_id).await
}

/// SHIORIへ NOTIFY コマンドで情報を通知（UKADOC notify イベント群）
///
/// NOTIFY の SHIORI 応答は baseware が無視する規約のため、応答テキストはそのまま返す。
/// `installedghostname` / `ghostpathlist` / `uniqueid` / `basewareversion` 等の
/// 起動時情報提示に使用する。
#[tauri::command]
pub async fn send_shiori_notify(
    state: tauri::State<'_, AppState>,
    event: String,
    references: Option<Vec<String>>,
    ghost_id: Option<String>,
) -> Result<String, String> {
    let mut req = ShioriRequest::notify(&event, &references.unwrap_or_default());
    req.sender = "NanaiMascot".to_string();
    send_shiori_request(state, req.build(), ghost_id).await
}

/// SHIORI イベントを送信し、解析済み `ShioriResponse` オブジェクトで返す
///
/// JS 側は生テキストパース（`ShioriProtocol.parseResponse`）を介さずに
/// status / value / 拡張ヘッダ（Marker や ErrorLevel 等）を取得できる。
#[tauri::command]
pub async fn send_shiori_event_typed(
    state: tauri::State<'_, AppState>,
    event: String,
    args: Option<Vec<String>>,
    ghost_id: Option<String>,
) -> Result<ShioriResponse, String> {
    let mut req = ShioriRequest::get(&event, &args.unwrap_or_default());
    req.sender = "NanaiMascot".to_string();

    let gid = ghost_id.unwrap_or_else(|| "main".to_string());
    let text = req.build();
    let raw = dispatch_request(&state, &text, &gid)?;
    let parsed = ShioriResponse::parse(&raw);
    if event != "OnSecondChange"
        && let Ok(ref res) = parsed
    {
        println!(
            "✨ SHIORI Event '{}' -> status={:?}, value='{}'",
            event,
            res.status,
            res.value.as_deref().unwrap_or("")
        );
    }
    parsed
}

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
    // 無音で実行
    Ok("Second changed".to_string())
}

/// SHIORI へ OnTranslate イベントを送信し、ゴースト側で翻訳されたさくらスクリプトを取得する (UKADOC 規格準拠)
#[tauri::command]
pub async fn send_on_translate(
    state: tauri::State<'_, AppState>,
    script: String,
    ghost_id: Option<String>,
) -> Result<String, String> {
    let mut req = ShioriRequest::get("OnTranslate", &[script.clone()]);
    req.sender = "NanaiMascot".to_string();
    let gid = ghost_id.unwrap_or_else(|| "main".to_string());

    match dispatch_request(&state, &req.build(), &gid) {
        Ok(raw) => {
            let parsed = ShioriResponse::parse(&raw);
            if let Ok(res) = parsed {
                if let Some(val) = res.value {
                    let trimmed = val.trim();
                    if !trimmed.is_empty() {
                        return Ok(trimmed.to_string());
                    }
                }
            }
            Ok(script)
        }
        Err(_) => Ok(script),
    }
}
