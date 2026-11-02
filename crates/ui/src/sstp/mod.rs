//! SSTP (Sakura Script Transfer Protocol) 実装（ukadoc-spec / sstp 準拠）
//! [req_res], [direct], [http], [keepalive], [method_send], [method_execute], [method_give], [method_communicate], [method_notify]
//!
//! SSTP/1.1, SSTP/1.2, SSTP/1.3, SSTP/1.4, DirectSSTP のリクエスト・レスポンス解析および構築を行う。

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// SSTP メソッド
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum SstpMethod {
    Send,
    Notify,
    Execute,
    Communicate,
    Give,
}

impl SstpMethod {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Send => "SEND",
            Self::Notify => "NOTIFY",
            Self::Execute => "EXECUTE",
            Self::Communicate => "COMMUNICATE",
            Self::Give => "GIVE",
        }
    }

    pub fn parse(s: &str) -> Option<Self> {
        let upper = s.trim().to_uppercase();
        if upper == "SEND" {
            Some(Self::Send)
        } else if upper == "NOTIFY" {
            Some(Self::Notify)
        } else if upper == "EXECUTE" {
            Some(Self::Execute)
        } else if upper == "COMMUNICATE" {
            Some(Self::Communicate)
        } else if upper == "GIVE" {
            Some(Self::Give)
        } else {
            None
        }
    }
}

/// SSTP レスポンスステータスコード
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum SstpStatusCode {
    Ok = 200,
    NoContent = 204,
    Break = 210,
    BadRequest = 400,
    NotFound = 404,
    RequestTimeout = 408,
    Conflict = 409,
    PayloadTooLarge = 413,
    Refuse = 420,
    InternalServerError = 500,
    NotImplemented = 501,
    ServiceUnavailable = 503,
    VersionNotSupported = 505,
    Invisible = 512,
}

impl SstpStatusCode {
    pub fn code(&self) -> u16 {
        *self as u16
    }

    pub fn reason_phrase(&self) -> &'static str {
        match self {
            Self::Ok => "OK",
            Self::NoContent => "No Content",
            Self::Break => "Break",
            Self::BadRequest => "Bad Request",
            Self::NotFound => "Not Found",
            Self::RequestTimeout => "Request Timeout",
            Self::Conflict => "Conflict",
            Self::PayloadTooLarge => "Payload Too Large",
            Self::Refuse => "Refuse",
            Self::InternalServerError => "Internal Server Error",
            Self::NotImplemented => "Not Implemented",
            Self::ServiceUnavailable => "Service Unavailable",
            Self::VersionNotSupported => "Version Not Supported",
            Self::Invisible => "Invisible",
        }
    }
}

/// DirectSSTP 関連定数 (Windows WM_COPYDATA 互換 dwData)
pub const DIRECT_SSTP_DWDATA: usize = 9801;

/// IfGhost によるスクリプト振り分けエントリ
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct IfGhostEntry {
    pub target: String,
    pub script: String,
}

/// SSTP リクエスト構造体
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SstpRequest {
    pub method: SstpMethod,
    pub version: String,
    pub charset: Option<String>,
    pub sender: String,
    pub script: Option<String>,
    pub event: Option<String>,
    pub sentence: Option<String>,
    pub command: Option<String>,
    pub hwnd: Option<u64>,
    pub receiver_ghost_hwnd: Option<u64>,
    pub receiver_ghost_name: Option<String>,
    pub security_level: Option<String>,
    pub security_origin: Option<String>,
    pub id: Option<String>,
    pub options: Vec<String>,
    pub entry: Option<String>,
    pub if_ghosts: Vec<IfGhostEntry>,
    pub references: HashMap<String, String>,
    pub pass_thru: HashMap<String, String>,
    pub keep_alive: bool,
    /// COMMUNICATE / GIVE 拡張ヘッダ: 送信元サーフィス番号 (例: "0,10")
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub surface: Option<String>,
    /// GIVE/旧仕様 拡張ヘッダ: 文書
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub document: Option<String>,
    /// GIVE/旧仕様 拡張ヘッダ: 楽曲名
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub song: Option<String>,
    /// 対象ゴースト名 (descript.txt の name)
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub ghost: Option<String>,
    /// SAORI over DirectSSTP: Module ヘッダ
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub module: Option<String>,
    /// DirectSSTP フラグ
    #[serde(default)]
    pub is_direct: bool,
}

/// Slot-01 Contract: SSTP メッセージ型エイリアス
pub type SstpMessage = SstpRequest;

impl SstpRequest {
    /// 生テキストから SSTP リクエストをパースする
    pub fn parse(raw: &str) -> Result<Self, String> {
        Self::parse_internal(raw, false)
    }

    /// DirectSSTP 生テキスト（WM_COPYDATA経由）をパースする
    pub fn parse_direct(raw: &str) -> Result<Self, String> {
        Self::parse_internal(raw, true)
    }

    fn parse_internal(raw: &str, is_direct: bool) -> Result<Self, String> {
        let mut lines = raw.lines();
        let first_line = lines.next().ok_or("Empty SSTP request")?.trim();
        if first_line.is_empty() {
            return Err("Empty SSTP request header line".to_string());
        }

        let parts: Vec<&str> = first_line.split_whitespace().collect();
        if parts.len() < 2 {
            return Err(format!("Invalid SSTP request line: {}", first_line));
        }

        // SAORI over DirectSSTP: "EXECUTE SAORI/1.0" or "GET Version SAORI/1.0"
        let method_str = parts[0];
        let method = SstpMethod::parse(method_str)
            .ok_or_else(|| format!("Unsupported SSTP method: {}", method_str))?;
        let version = parts[1].to_string();

        let mut charset = None;
        let mut sender = String::new();
        let mut default_script = None;
        let mut event = None;
        let mut sentence = None;
        let mut command = None;
        let mut hwnd = None;
        let mut receiver_ghost_hwnd = None;
        let mut receiver_ghost_name = None;
        let mut security_level = None;
        let mut id = None;
        let mut security_origin = None;
        let mut options = Vec::new();
        let mut entry = None;
        let mut if_ghosts = Vec::new();
        let mut current_if_ghost: Option<String> = None;
        let mut references = HashMap::new();
        let mut pass_thru = HashMap::new();
        let mut keep_alive = false;
        let mut surface = None;
        let mut document = None;
        let mut song = None;
        let mut ghost = None;
        let mut module = None;

        for line in lines {
            let line = line.trim();
            if line.is_empty() {
                break;
            }
            if let Some((k, v)) = line.split_once(':') {
                let key = k.trim();
                let val = v.trim().to_string();
                let key_lower = key.to_lowercase();

                if key_lower == "id" {
                    id = Some(val);
                } else if key_lower == "charset" {
                    charset = Some(val);
                } else if key_lower == "sender" {
                    sender = val;
                } else if key_lower == "script" {
                    if let Some(target) = current_if_ghost.take() {
                        if_ghosts.push(IfGhostEntry {
                            target,
                            script: val,
                        });
                    } else if default_script.is_none() {
                        default_script = Some(val);
                    }
                } else if key_lower == "ifghost" {
                    current_if_ghost = Some(val);
                } else if key_lower == "event" {
                    event = Some(val);
                } else if key_lower == "sentence" {
                    sentence = Some(val);
                } else if key_lower.starts_with("command") {
                    // Command or Command[param1,param2...]
                    command = Some(val);
                } else if key_lower == "hwnd" {
                    hwnd = val.parse().ok();
                } else if key_lower == "receiverghosthwnd" {
                    receiver_ghost_hwnd = val.parse().ok();
                } else if key_lower == "receiverghostname" {
                    receiver_ghost_name = Some(val);
                } else if key_lower == "securitylevel" {
                    security_level = Some(val);
                } else if key_lower == "securityorigin" {
                    security_origin = Some(val);
                } else if key_lower == "option" {
                    for opt in val.split(',') {
                        let opt_trim = opt.trim();
                        if !opt_trim.is_empty() {
                            options.push(opt_trim.to_string());
                        }
                    }
                } else if key_lower == "entry" {
                    entry = Some(val);
                } else if key_lower == "keepalive" {
                    keep_alive = val.to_lowercase() == "true" || val == "1";
                } else if key_lower == "surface" {
                    surface = Some(val);
                } else if key_lower == "document" {
                    document = Some(val);
                } else if key_lower == "song" {
                    song = Some(val);
                } else if key_lower == "ghost" {
                    ghost = Some(val);
                } else if key_lower == "module" {
                    module = Some(val);
                } else if key_lower.starts_with("reference") || key_lower.starts_with("argument") {
                    // Argument0 -> Reference0 正規化
                    let norm_key = if key_lower.starts_with("argument") {
                        format!("Reference{}", &key[8..])
                    } else {
                        key.to_string()
                    };
                    references.insert(norm_key, val);
                } else if key_lower.starts_with("x-sstp-passthru-") {
                    pass_thru.insert(key.to_string(), val);
                }
            }
        }

        if sender.is_empty() {
            sender = "Unknown".to_string();
        }

        // DirectSSTP または Owned SSTP (ID指定) の場合 SecurityLevel は Local
        if is_direct || id.is_some() {
            security_level = Some("local".to_string());
        }

        Ok(Self {
            method,
            version,
            charset,
            sender,
            script: default_script,
            event,
            sentence,
            command,
            hwnd,
            receiver_ghost_hwnd,
            receiver_ghost_name,
            security_level,
            security_origin,
            id,
            options,
            entry,
            if_ghosts,
            references,
            pass_thru,
            keep_alive,
            surface,
            document,
            song,
            ghost,
            module,
            is_direct,
        })
    }

    /// 対象のゴースト名（sakura名, kero名）に応じたスクリプトを解決する
    pub fn resolve_script(&self, sakura_name: &str, kero_name: &str) -> Option<&str> {
        for entry in &self.if_ghosts {
            if let Some((target_sakura, target_kero)) = entry.target.split_once(',') {
                if target_sakura.trim().eq_ignore_ascii_case(sakura_name)
                    && target_kero.trim().eq_ignore_ascii_case(kero_name)
                {
                    return Some(&entry.script);
                }
            } else if entry.target.trim().eq_ignore_ascii_case(sakura_name) {
                return Some(&entry.script);
            }
        }
        self.script.as_deref()
    }

    /// 指定されたオプションが含まれるか判定
    pub fn has_option(&self, opt: &str) -> bool {
        self.options.iter().any(|o| o.eq_ignore_ascii_case(opt))
    }

    /// nobreak オプション指定（実行中スクリプト終了待ち）
    pub fn is_nobreak(&self) -> bool {
        self.has_option("nobreak")
    }

    /// notranslate オプション指定（OnTranslate等の変換スキップ）
    pub fn is_notranslate(&self) -> bool {
        self.has_option("notranslate")
    }

    /// nodescript オプション指定（バルーンのSSTP表示無効化）
    pub fn is_nodescript(&self) -> bool {
        self.has_option("nodescript")
    }

    /// strict オプション指定（SakuraScript解釈失敗をログ記録）
    pub fn is_strict(&self) -> bool {
        self.has_option("strict")
    }

    /// notify オプション指定
    pub fn is_notify(&self) -> bool {
        self.has_option("notify")
    }

    /// SAORI over DirectSSTP のリクエストであるか判定
    pub fn is_saori_request(&self) -> bool {
        self.module.is_some() || self.version.to_uppercase().contains("SAORI")
    }
}

/// SSTP レスポンス構造体
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SstpResponse {
    pub version: String,
    pub status: SstpStatusCode,
    pub charset: String,
    pub script: Option<String>,
    pub references: HashMap<String, String>,
    pub pass_thru: HashMap<String, String>,
    pub additional_data: Option<String>,
    /// SAORI / エラー応答ヘッダ (ErrorDescription)
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub error_description: Option<String>,
}

impl SstpResponse {
    pub fn new(status: SstpStatusCode) -> Self {
        Self {
            version: "SSTP/1.4".to_string(),
            status,
            charset: "UTF-8".to_string(),
            script: None,
            references: HashMap::new(),
            pass_thru: HashMap::new(),
            additional_data: None,
            error_description: None,
        }
    }

    pub fn ok(script: Option<String>) -> Self {
        let mut res = Self::new(SstpStatusCode::Ok);
        res.script = script;
        res
    }

    pub fn no_content() -> Self {
        Self::new(SstpStatusCode::NoContent)
    }

    pub fn bad_request() -> Self {
        Self::new(SstpStatusCode::BadRequest)
    }

    pub fn not_found() -> Self {
        Self::new(SstpStatusCode::NotFound)
    }

    pub fn conflict() -> Self {
        Self::new(SstpStatusCode::Conflict)
    }

    pub fn refuse() -> Self {
        Self::new(SstpStatusCode::Refuse)
    }

    pub fn payload_too_large() -> Self {
        Self::new(SstpStatusCode::PayloadTooLarge)
    }

    pub fn internal_server_error() -> Self {
        Self::new(SstpStatusCode::InternalServerError)
    }

    pub fn invisible() -> Self {
        Self::new(SstpStatusCode::Invisible)
    }

    pub fn service_unavailable() -> Self {
        Self::new(SstpStatusCode::ServiceUnavailable)
    }

    pub fn version_not_supported() -> Self {
        Self::new(SstpStatusCode::VersionNotSupported)
    }

    /// EXECUTE コマンド用のレスポンス構築（追加データ付き）
    pub fn with_additional_data(mut self, data: impl Into<String>) -> Self {
        self.additional_data = Some(data.into());
        self
    }

    /// ErrorDescription ヘッダを設定
    pub fn with_error_description(mut self, desc: impl Into<String>) -> Self {
        self.error_description = Some(desc.into());
        self
    }

    /// SSTP レスポンス文字列を構築する
    pub fn build(&self) -> String {
        let mut out = format!(
            "{} {} {}\r\n",
            self.version,
            self.status.code(),
            self.status.reason_phrase()
        );
        out.push_str(&format!("Charset: {}\r\n", self.charset));
        if let Some(ref script) = self.script {
            // スクリプト内の改行は除去する（仕様準拠）
            let flat_script = script.replace(['\r', '\n'], "");
            out.push_str(&format!("Script: {}\r\n", flat_script));
        }

        if let Some(ref err) = self.error_description {
            out.push_str(&format!("ErrorDescription: {}\r\n", err));
        }

        // References
        let mut ref_keys: Vec<_> = self.references.keys().collect();
        ref_keys.sort();
        for k in ref_keys {
            out.push_str(&format!("{}: {}\r\n", k, self.references[k]));
        }

        // PassThru
        let mut pt_keys: Vec<_> = self.pass_thru.keys().collect();
        pt_keys.sort();
        for k in pt_keys {
            out.push_str(&format!("{}: {}\r\n", k, self.pass_thru[k]));
        }

        out.push_str("\r\n");

        if let Some(ref data) = self.additional_data {
            out.push_str(data);
            if !data.ends_with("\r\n") {
                out.push_str("\r\n");
            }
            out.push_str("\r\n");
        }

        out
    }
}

/// SSTP EXECUTE コマンドのディスパッチ処理ヘルパー
#[derive(Debug, Clone, Default)]
pub struct SstpGhostContext {
    pub name: String,
    pub sakura_name: String,
    pub kero_name: String,
    pub shell_name: String,
    pub balloon_name: String,
    pub version: String,
    pub short_version: String,
    pub status: String,
    pub fmo_text: String,
    pub installed_ghosts: Vec<String>,
}

/// EXECUTE コマンドを処理して適切な SstpResponse を生成する
pub fn handle_execute_command(command_str: &str, ctx: &SstpGhostContext) -> SstpResponse {
    let cmd = command_str.trim();
    let (cmd_name, _args) = if let Some((name, rest)) = cmd.split_once('[') {
        (name.trim(), rest.trim_end_matches(']').trim())
    } else {
        (cmd, "")
    };

    match cmd_name.to_lowercase().as_str() {
        "getname" => {
            let data = format!("{},{}", ctx.sakura_name, ctx.kero_name);
            SstpResponse::ok(None).with_additional_data(data)
        }
        "getnames" => {
            let data = ctx.installed_ghosts.join("\r\n");
            SstpResponse::ok(None).with_additional_data(data)
        }
        "getghostname" => SstpResponse::ok(None).with_additional_data(ctx.name.clone()),
        "getshellname" => SstpResponse::ok(None).with_additional_data(ctx.shell_name.clone()),
        "getballoonname" => SstpResponse::ok(None).with_additional_data(ctx.balloon_name.clone()),
        "getversion" => SstpResponse::ok(None).with_additional_data(ctx.version.clone()),
        "getshortversion" => SstpResponse::ok(None).with_additional_data(ctx.short_version.clone()),
        "getstatus" => {
            if ctx.status.is_empty() {
                SstpResponse::ok(None)
            } else {
                SstpResponse::ok(None).with_additional_data(ctx.status.clone())
            }
        }
        "getfmo" => SstpResponse::ok(None).with_additional_data(ctx.fmo_text.clone()),
        "quiet" | "restore" => SstpResponse::ok(None),
        _ => SstpResponse::bad_request().with_error_description("unknown command"),
    }
}

#[cfg(test)]
mod tests;
