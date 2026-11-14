use crate::common::state::AppState;
use nanai_android_mascot_ui::{
    ShioriRequest, ShioriResponse, build_standard_capability_references,
};

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

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SendShioriEventParams {
    event: String,
    references: Option<Vec<String>>,
    ghost_id: Option<String>,
}

impl SendShioriEventParams {
    // Add getter methods
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
///
/// リクエスト構築は `nanai_android_mascot_ui` の ukadoc-spec 準拠
/// `ShioriRequest` モデル（GET / Sender / Charset / ID / Reference0..N）に一本化。
#[tauri::command]
pub async fn send_shiori_event(
    state: tauri::State<'_, AppState>,
    params: SendShioriEventParams,
) -> Result<String, String> {
    let mut req = ShioriRequest::get(
        params.event(),
        &params.references().cloned().unwrap_or_default(),
    );
    req.sender = "NanaiMascot".to_string();
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
    // Add getter methods
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
///
/// [@manual: manual/translator.md] Translator integration / OnTranslate hook support for script post-processing
/// NOTIFY の SHIORI 応答は baseware が無視する規約のため、応答テキストはそのまま返す。
/// `installedghostname` / `ghostpathlist` / `uniqueid` / `basewareversion` / `capability` 等の
/// 起動時情報提示に使用する。
#[tauri::command]
pub async fn send_shiori_notify(
    state: tauri::State<'_, AppState>,
    params: SendShioriNotifyParams,
) -> Result<String, String> {
    let mut req = ShioriRequest::notify(
        params.event(),
        &params.references().cloned().unwrap_or_default(),
    );
    req.sender = "NanaiMascot".to_string();
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
    req.sender = "NanaiMascot".to_string();
    send_shiori_request(state, req.build(), ghost_id).await
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SendShioriEventTypedParams {
    event: String,
    args: Option<Vec<String>>,
    ghost_id: Option<String>,
}

impl SendShioriEventTypedParams {
    // Add getter methods
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
///
/// JS 側は生テキストパース（`ShioriProtocol.parseResponse`）を介さずに
/// status / value / 拡張ヘッダ（Marker や ErrorLevel 等）を取得できる。
#[tauri::command]
pub async fn send_shiori_event_typed(
    state: tauri::State<'_, AppState>,
    params: SendShioriEventTypedParams,
) -> Result<ShioriResponse, String> {
    let event = params.event().to_string();
    let mut req = ShioriRequest::get(&event, &params.args().cloned().unwrap_or_default());
    req.sender = "NanaiMascot".to_string();

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
    let mut req = ShioriRequest::get("OnTranslate", std::slice::from_ref(&script));
    req.sender = "NanaiMascot".to_string();
    let gid = ghost_id.unwrap_or_else(|| "main".to_string());

    match dispatch_request(&state, &req.build(), &gid) {
        Ok(raw) => {
            let parsed = ShioriResponse::parse(&raw);
            if let Ok(res) = parsed
                && let Some(val) = res.value
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

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SendGhostCallEventParams {
    event: String,
    target_ghost_name: String,
    ghost_id: Option<String>,
}

impl SendGhostCallEventParams {
    // Add getter methods
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
    req.sender = "NanaiMascot".to_string();
    let gid = params.ghost_id().unwrap_or("main");
    dispatch_request(&state, &req.build(), gid)
}
