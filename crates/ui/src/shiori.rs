//! SHIORI/3.0 プロトコル実装（ukadoc-spec / shiori3 準拠）
//!
//! リクエスト（GET / NOTIFY）・レスポンス（200 / 204 / 311 / 312 / 400 / 500）
//! の構築・解析を行う。SSP 拡張ヘッダ（SenderType / SecurityLevel /
//! SecurityOrigin / Status / BaseID / X-SSTP-PassThru- / ValueNotify /
//! Marker / ErrorLevel / ErrorDescription / BalloonOffset / Age /
//! MarkerSend）にも対応する。
//!
//! 改行コードは CR+LF、末尾は空行（CRLF×2）で終端する。
//! `Charset` は UTF-8 を既定とする。

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

// ---------------------------------------------------------------- メソッド

/// リクエストメソッド（GET: 返値前提 / NOTIFY: 返値無視）
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Serialize, Deserialize)]
pub enum ShioriMethod {
    #[default]
    Get,
    Notify,
}

impl ShioriMethod {
    pub fn parse(value: &str) -> Self {
        if value.trim().eq_ignore_ascii_case("notify") {
            Self::Notify
        } else {
            Self::Get
        }
    }

    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Get => "GET",
            Self::Notify => "NOTIFY",
        }
    }
}

// ---------------------------------------------------------------- SenderType

/// `SenderType` の属性トークン（SSP拡張、カンマ区切りで複数指定可）
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum SenderTypeTag {
    /// アプリケーション内部
    Internal,
    /// アプリケーション外部
    External,
    /// Sakura API
    SakuraApi,
    /// `\![embed]` タグ
    Embed,
    /// `\![raise]` タグ
    Raise,
    /// プロパティシステム参照
    Property,
    /// プラグイン
    Plugin,
    /// SSTP
    Sstp,
    /// コミュニケート
    Communicate,
    /// その他（拡張）
    Custom(String),
}

impl SenderTypeTag {
    pub fn parse(value: &str) -> Self {
        match value.trim().to_lowercase().as_str() {
            "internal" => Self::Internal,
            "external" => Self::External,
            "sakuraapi" => Self::SakuraApi,
            "embed" => Self::Embed,
            "raise" => Self::Raise,
            "property" => Self::Property,
            "plugin" => Self::Plugin,
            "sstp" => Self::Sstp,
            "communicate" => Self::Communicate,
            other => Self::Custom(other.to_string()),
        }
    }

    pub fn token(&self) -> String {
        match self {
            Self::Internal => "internal".into(),
            Self::External => "external".into(),
            Self::SakuraApi => "sakuraapi".into(),
            Self::Embed => "embed".into(),
            Self::Raise => "raise".into(),
            Self::Property => "property".into(),
            Self::Plugin => "plugin".into(),
            Self::Sstp => "sstp".into(),
            Self::Communicate => "communicate".into(),
            Self::Custom(s) => s.clone(),
        }
    }
}

/// カンマ区切りの SenderType 列
pub fn parse_sender_types(value: &str) -> Vec<SenderTypeTag> {
    value
        .split(',')
        .map(SenderTypeTag::parse)
        .filter(|t| !matches!(t, SenderTypeTag::Custom(v) if v.is_empty()))
        .collect()
}

// ---------------------------------------------------------------- SecurityLevel

/// セキュリティレベル（script / event 送信元の安全性）
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SecurityLevel {
    Local,
    External,
}

impl SecurityLevel {
    pub fn parse(value: &str) -> Option<Self> {
        match value.trim().to_lowercase().as_str() {
            "local" => Some(Self::Local),
            "external" => Some(Self::External),
            _ => None,
        }
    }

    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Local => "local",
            Self::External => "external",
        }
    }
}

// ---------------------------------------------------------------- Status（SSP拡張）

/// ゴースト実行状態（`Status` ヘッダのトークン群）
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum GhostStatusToken {
    Talking,
    Choosing,
    Minimizing,
    Induction,
    Passive,
    TimeCritical,
    NoUserBreak,
    Online,
    /// `opening(input / teach / dialog...)`
    Opening(String),
    /// `balloon(0=2 / 1=0)` の (キャラID, バルーンID) 列
    Balloon(Vec<(u32, u32)>),
    /// その他の拡張トークン
    Custom(String),
}

impl GhostStatusToken {
    /// Status ヘッダ値（カンマ区切り）をパースする
    pub fn parse_list(value: &str) -> Vec<Self> {
        let mut out = Vec::new();
        for token in value.trim().split(',') {
            let t = token.trim();
            if t.is_empty() {
                continue;
            }
            let lower = t.to_lowercase();
            if let Some(kind) = lower.strip_prefix("opening(") {
                out.push(Self::Opening(kind.trim_end_matches(')').to_string()));
            } else if let Some(ids) = lower.strip_prefix("balloon(") {
                let inner = ids.trim_end_matches(')').replace('/', ",0,");
                let pairs = inner
                    .split(',')
                    .filter(|s| !s.trim().is_empty())
                    .map(|s| match s.trim().split_once('=') {
                        Some((c, b)) => (
                            c.trim().parse::<u32>().unwrap_or(0),
                            b.trim().parse::<u32>().unwrap_or(0),
                        ),
                        None => (s.trim().parse::<u32>().unwrap_or(0), 0),
                    })
                    .collect();
                out.push(Self::Balloon(pairs));
            } else {
                out.push(match lower.as_str() {
                    "talking" => Self::Talking,
                    "choosing" => Self::Choosing,
                    "minimizing" => Self::Minimizing,
                    "induction" => Self::Induction,
                    "passive" => Self::Passive,
                    "timecritical" => Self::TimeCritical,
                    "nouserbreak" => Self::NoUserBreak,
                    "online" => Self::Online,
                    other => Self::Custom(other.to_string()),
                });
            }
        }
        out
    }

    /// Status ヘッダ値（カンマ区切り）を書き出す
    pub fn write_tokens(tokens: &[Self]) -> String {
        tokens
            .iter()
            .map(|t| match t {
                Self::Talking => "talking".into(),
                Self::Choosing => "choosing".into(),
                Self::Minimizing => "minimizing".into(),
                Self::Induction => "induction".into(),
                Self::Passive => "passive".into(),
                Self::TimeCritical => "timecritical".into(),
                Self::NoUserBreak => "nouserbreak".into(),
                Self::Online => "online".into(),
                Self::Opening(kind) => format!("opening({})", kind),
                Self::Balloon(pairs) => format!(
                    "balloon({})",
                    pairs
                        .iter()
                        .map(|(c, b)| format!("{}={}", c, b))
                        .collect::<Vec<_>>()
                        .join("/")
                ),
                Self::Custom(s) => s.clone(),
            })
            .collect::<Vec<_>>()
            .join(",")
    }
}

// ---------------------------------------------------------------- ステータスコード

/// レスポンスステータスコード（ukadoc 収録分）
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Serialize, Deserialize)]
pub enum StatusCode {
    /// 200: 成功、Value あり
    #[default]
    Ok,
    /// 204: 成功、Value なし
    NoContent,
    /// 311 (OnTeach): 追加情報取得が必要（入力ボックス再オープン）
    NotEnough,
    /// 312 (OnTeach): 直近の Reference を破棄し再問合せ
    Advice,
    /// 400: リクエスト解釈不能
    BadRequest,
    /// 500: SHIORI 内部エラー
    InternalError,
    /// その他（互換実装の独自コード）
    Other(u16),
}

impl StatusCode {
    pub fn parse(code: u16) -> Self {
        match code {
            200 => Self::Ok,
            204 => Self::NoContent,
            311 => Self::NotEnough,
            312 => Self::Advice,
            400 => Self::BadRequest,
            500 => Self::InternalError,
            other => Self::Other(other),
        }
    }

    pub fn code(&self) -> u16 {
        match self {
            Self::Ok => 200,
            Self::NoContent => 204,
            Self::NotEnough => 311,
            Self::Advice => 312,
            Self::BadRequest => 400,
            Self::InternalError => 500,
            Self::Other(n) => *n,
        }
    }

    pub fn text(&self) -> &'static str {
        match self {
            Self::Ok => "OK",
            Self::NoContent => "No Content",
            Self::NotEnough => "Not Enough",
            Self::Advice => "Advice",
            Self::BadRequest => "Bad Request",
            Self::InternalError => "Internal Server Error",
            Self::Other(_) => "",
        }
    }
}

// ---------------------------------------------------------------- ErrorLevel（SSP拡張）

/// SHIORI 内部エラーの通知レベル（`\u{1}` 区切りで複数指定可）
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ErrorLevel {
    Info,
    Notice,
    Warning,
    Error,
    Critical,
    Custom(String),
}

impl ErrorLevel {
    /// `\u{1}` 区切りの ErrorLevel ヘッダ値をパースする
    pub fn parse_list(value: &str) -> Vec<Self> {
        value
            .split('\u{1}')
            .map(|s| match s.trim().to_lowercase().as_str() {
                "info" => Self::Info,
                "notice" => Self::Notice,
                "warning" => Self::Warning,
                "error" => Self::Error,
                "critical" => Self::Critical,
                other => Self::Custom(other.to_string()),
            })
            .collect()
    }

    /// `\u{1}` 区切りの ErrorLevel ヘッダ値を書き出す
    pub fn join_tokens(levels: &[Self]) -> String {
        levels
            .iter()
            .map(|l| match l {
                Self::Info => "info".into(),
                Self::Notice => "notice".into(),
                Self::Warning => "warning".into(),
                Self::Error => "error".into(),
                Self::Critical => "critical".into(),
                Self::Custom(s) => s.clone(),
            })
            .collect::<Vec<_>>()
            .join("\u{1}")
    }
}

// ---------------------------------------------------------------- リクエスト

/// SHIORI/3.0 リクエスト
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct ShioriRequest {
    pub method: ShioriMethod,
    pub charset: String,
    pub sender: String,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub sender_type: Vec<SenderTypeTag>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub security_level: Option<SecurityLevel>,
    /// `SecurityOrigin: null`（情報なし）とヘッダ省略を区別するため `Some(None)` で表現
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub security_origin: Option<Option<String>>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub status: Vec<GhostStatusToken>,
    pub id: String,
    /// 互換可能な基本イベント名（SSP拡張。`OnFirstBoot` → `OnBoot` など）
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub base_id: Option<String>,
    /// Reference0..N
    pub references: Vec<String>,
    /// `X-SSTP-PassThru-(後続)` → 値
    #[serde(default, skip_serializing_if = "BTreeMap::is_empty")]
    pub passthru: BTreeMap<String, String>,
}

impl ShioriRequest {
    /// GET（返値前提）リクエストを作る
    pub fn get(id: &str, references: &[String]) -> Self {
        Self {
            method: ShioriMethod::Get,
            charset: "UTF-8".into(),
            sender: "NanaiAndroidMascot".into(),
            id: id.to_string(),
            references: references.to_vec(),
            ..Default::default()
        }
    }

    /// NOTIFY（返値無視）リクエストを作る
    pub fn notify(id: &str, references: &[String]) -> Self {
        let mut req = Self::get(id, references);
        req.method = ShioriMethod::Notify;
        req
    }

    /// テキストから SHIORI/3.0 リクエストをパースする（LF / CRLF 両対応）
    pub fn parse(text: &str) -> Result<Self, String> {
        let mut lines = text.split('\n').map(|l| l.trim_end_matches('\r'));
        let first = lines.next().unwrap_or("");
        let mut fields = first.split_whitespace();
        let method = fields.next().ok_or_else(|| "empty request".to_string())?;
        let version = fields
            .next()
            .ok_or_else(|| "missing protocol".to_string())?;
        if !version.eq_ignore_ascii_case("SHIORI/3.0")
            && !version.eq_ignore_ascii_case("SHIORI/2.6")
        {
            return Err(format!("unsupported protocol version: {}", version));
        }

        let mut req = Self {
            method: ShioriMethod::parse(method),
            ..Default::default()
        };
        req.charset = "UTF-8".into();

        let mut has_id = false;
        for line in lines {
            if line.is_empty() {
                break; // 空行 = ヘッダ終端
            }
            let (key, value) = match line.split_once(':') {
                Some((k, v)) => (k.trim().to_string(), v.trim().to_string()),
                None => continue,
            };
            let lower = key.to_lowercase();
            match lower.as_str() {
                "charset" => req.charset = value,
                "sender" => req.sender = value,
                "sendertype" => req.sender_type = parse_sender_types(&value),
                "securitylevel" => req.security_level = SecurityLevel::parse(&value),
                "securityorigin" => {
                    let origin = if value.eq_ignore_ascii_case("null") {
                        None
                    } else {
                        Some(value.clone())
                    };
                    req.security_origin = Some(origin);
                }
                "status" => req.status = GhostStatusToken::parse_list(&value),
                "id" => {
                    req.id = value;
                    has_id = true;
                }
                "baseid" => req.base_id = Some(value),
                "x-sstp-passthru-markersend" => {} // passthru 名は後段の prefix 判定で処理
                _ => {
                    if let Some(rest) = lower.strip_prefix("reference") {
                        if let Some(idx) = rest.parse::<usize>().ok() {
                            let n = idx;
                            if req.references.len() <= n {
                                req.references.resize(n + 1, String::new());
                            }
                            req.references[n] = value;
                        }
                    } else if let Some(rest) = key.strip_prefix("X-SSTP-PassThru-") {
                        req.passthru.insert(rest.to_string(), value.clone());
                    } else if let Some(rest) = lower.strip_prefix("x-sstp-passthru-") {
                        req.passthru.insert(rest.to_string(), value);
                    }
                }
            }
        }

        if !has_id {
            return Err("ID header is missing".to_string());
        }
        Ok(req)
    }

    /// CR+LF 終端のリクエストテキストを生成する（末尾は空行 CRLF×2）
    pub fn build(&self) -> String {
        let mut out = String::new();
        out.push_str(&format!("{} SHIORI/3.0\r\n", self.method.as_str()));
        out.push_str(&format!("Charset: {}\r\n", self.charset));
        out.push_str(&format!("Sender: {}\r\n", self.sender));
        if !self.sender_type.is_empty() {
            let tokens = self
                .sender_type
                .iter()
                .map(|t| t.token())
                .collect::<Vec<_>>()
                .join(",");
            out.push_str(&format!("SenderType: {}\r\n", tokens));
        }
        if let Some(level) = &self.security_level {
            out.push_str(&format!("SecurityLevel: {}\r\n", level.as_str()));
        }
        if let Some(origin) = &self.security_origin {
            out.push_str(&format!(
                "SecurityOrigin: {}\r\n",
                origin.clone().unwrap_or_else(|| "null".into())
            ));
        }
        if !self.status.is_empty() {
            out.push_str(&format!(
                "Status: {}\r\n",
                GhostStatusToken::write_tokens(&self.status)
            ));
        }
        // SecurityLevel 系は ID より前に出す（ukadoc の推奨順）が、ここでは必須順のみ保証
        if let Some(base) = &self.base_id {
            out.push_str(&format!("BaseID: {}\r\n", base));
        }
        out.push_str(&format!("ID: {}\r\n", self.id));
        for (i, r) in self.references.iter().enumerate() {
            out.push_str(&format!("Reference{}: {}\r\n", i, r));
        }
        for (suffix, value) in &self.passthru {
            out.push_str(&format!("X-SSTP-PassThru-{}: {}\r\n", suffix, value));
        }
        out.push_str("\r\n");
        out
    }
}

// ---------------------------------------------------------------- レスポンス

/// SHIORI/3.0 レスポンス
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct ShioriResponse {
    pub status: StatusCode,
    pub charset: String,
    /// `Sender:`（通常は SHIORI 実装名）
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub sender: Option<String>,
    /// `Value:`（喋りたい さくらスクリプト・複数行は \n 連結）
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub value: Option<String>,
    /// `ValueNotify:`（SSP拡張・NOTIFY でも即時実行される実験的機能）
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub value_notify: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub security_level: Option<SecurityLevel>,
    /// バルーンマーカー表示文字列（SSP拡張）
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub marker: Option<String>,
    /// `\u{1}` 区切り複数（ErrorDescription と要素数一致が規格要求）
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub error_level: Vec<ErrorLevel>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub error_description: Vec<String>,
    /// バルーンオフセット（X, Y）（SSP拡張）
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub balloon_offset: Option<(i32, i32)>,
    /// Reference0（コミュニケート送り先 = ゴースト\0側の名前）
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub reference0: Option<String>,
    /// Reference1..N（互換性のため Reference1 = 通信先 OnCommunicate の Reference2）
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub references: Vec<String>,
    /// コミュニケート世代数（SSP拡張・SHIORI/2.x 互換）
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub age: Option<u32>,
    /// 相手側に表示するバルーンマーカー（SSTP Marker として送信される）
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub marker_send: Option<String>,
    /// `X-SSTP-PassThru-(後続)` → 値（複数指定可能）
    #[serde(default, skip_serializing_if = "BTreeMap::is_empty")]
    pub passthru: BTreeMap<String, String>,
}

impl ShioriResponse {
    /// 204 No Content 形式の固定レスポンス
    pub fn no_content() -> Self {
        Self {
            status: StatusCode::NoContent,
            charset: "UTF-8".into(),
            ..Default::default()
        }
    }

    /// 200 OK（Value あり）レスポンス
    pub fn ok(value: &str) -> Self {
        Self {
            status: StatusCode::Ok,
            charset: "UTF-8".into(),
            value: Some(value.to_string()),
            ..Default::default()
        }
    }

    /// OnTeach の追加情報要求（311 Not Enough / 312 Advice）か
    pub fn is_teach_pending(&self) -> bool {
        matches!(
            self.status,
            StatusCode::NotEnough | StatusCode::Advice
        )
    }

    /// テキストから SHIORI/3.0 レスポンスをパースする（LF / CRLF 両対応）
    ///
    /// Value ヘッダの値が複数行に跨る場合、継続行は `\n` 連結される。
    pub fn parse(text: &str) -> Result<Self, String> {
        let lines = text.split('\n').map(|l| l.trim_end_matches('\r'));
        let mut it = lines.into_iter().peekable();
        let first = it.next().unwrap_or("");
        let mut tokens = first.split_whitespace();
        let proto = tokens.next().unwrap_or("");
        if !proto.eq_ignore_ascii_case("SHIORI/3.0") && !proto.eq_ignore_ascii_case("SHIORI/2.6") {
            return Err(format!("unsupported protocol version: {}", proto));
        }
        let status_code = tokens
            .next()
            .map(|t| t.trim().to_string())
            .and_then(|t| t.parse::<u16>().ok())
            .ok_or_else(|| "missing status code".to_string())?;

        let mut res = Self {
            status: StatusCode::parse(status_code),
            charset: "UTF-8".into(),
            ..Default::default()
        };

        let mut in_value: Option<&str> = None;
        for line in it {
            if line.is_empty() {
                break;
            }
            // ヘッダ行判定: 行頭からコロンまでがトークン名
            match line.split_once(':') {
                Some((key, value)) => {
                    let key_ok = !key.trim().contains(char::is_whitespace)
                        || key.trim().starts_with("X-SSTP-");
                    if !key_ok && !is_header_key(key) {
                        // 継続行として処理
                        push_continuation(&mut res, in_value, line);
                        continue;
                    }
                    let key_l = key.trim().to_lowercase();
                    let value = value.trim();
                    in_value = None;
                    match key_l.as_str() {
                        "charset" => res.charset = value.to_string(),
                        "sender" => res.sender = Some(value.to_string()),
                        "value" => {
                            res.value = Some(value.to_string());
                            in_value = Some("value");
                        }
                        "valuenotify" => {
                            res.value_notify = Some(value.to_string());
                            in_value = Some("value_notify");
                        }
                        "securitylevel" => res.security_level = SecurityLevel::parse(value),
                        "marker" => res.marker = Some(value.to_string()),
                        "markererror" => {} // 実在しない（guard）
                        "errorlevel" => res.error_level = ErrorLevel::parse_list(value),
                        "errordescription" => {
                            res.error_description =
                                value.split('\u{1}').map(str::to_string).collect()
                        }
                        "balloonoffset" => {
                            res.balloon_offset = value.split_once(',').and_then(|(x, y)| {
                                Some((x.trim().parse::<i32>().ok()?, y.trim().parse::<i32>().ok()?))
                            });
                        }
                        "reference0" => res.reference0 = Some(value.to_string()),
                        "age" => res.age = value.parse::<u32>().ok(),
                        "markersend" => res.marker_send = Some(value.to_string()),
                        "x-sstp-passthru-markersend" => {}
                        _ => {
                            if let Some(rest) = key_l.strip_prefix("reference") {
                                if let Some(idx) = rest.parse::<usize>().ok() {
                                    let n = idx.saturating_sub(1);
                                    if res.references.len() <= n {
                                        res.references.resize(n + 1, String::new());
                                    }
                                    res.references[n] = value.to_string();
                                }
                            } else if let Some(rest) = key_str_prefix(&key) {
                                res.passthru.insert(rest, value.to_string());
                            }
                        }
                    }
                }
                None => push_continuation(&mut res, in_value, line),
            }
        }

        Ok(res)
    }

    /// CR+LF 終端のレスポンステキストを生成する（末尾は空行 CRLF×2）
    pub fn build(&self) -> String {
        let mut out = String::new();
        let status_text = self.status.text();
        if status_text.is_empty() {
            out.push_str(&format!("SHIORI/3.0 {}\r\n", self.status.code()));
        } else {
            out.push_str(&format!(
                "SHIORI/3.0 {} {}\r\n",
                self.status.code(),
                status_text
            ));
        }
        out.push_str(&format!("Charset: {}\r\n", self.charset));
        if let Some(sender) = &self.sender {
            out.push_str(&format!("Sender: {}\r\n", sender));
        }
        if let Some(value) = &self.value {
            write_multiline_header(&mut out, "Value", value);
        }
        if let Some(value) = &self.value_notify {
            write_multiline_header(&mut out, "ValueNotify", value);
        }
        if let Some(level) = &self.security_level {
            out.push_str(&format!("SecurityLevel: {}\r\n", level.as_str()));
        }
        if let Some(marker) = &self.marker {
            out.push_str(&format!("Marker: {}\r\n", marker));
        }
        if !self.error_level.is_empty() {
            out.push_str(&format!(
                "ErrorLevel: {}\r\n",
                ErrorLevel::join_tokens(&self.error_level)
            ));
        }
        if !self.error_description.is_empty() {
            let desc = self.error_description.join("\u{1}");
            out.push_str(&format!("ErrorDescription: {}\r\n", desc));
        }
        if let Some((x, y)) = self.balloon_offset {
            out.push_str(&format!("BalloonOffset: {},{}\r\n", x, y));
        }
        if let Some(r0) = &self.reference0 {
            out.push_str(&format!("Reference0: {}\r\n", r0));
        }
        for (i, r) in self.references.iter().enumerate() {
            out.push_str(&format!("Reference{}: {}\r\n", i + 1, r));
        }
        if let Some(age) = self.age {
            out.push_str(&format!("Age: {}\r\n", age));
        }
        if let Some(marker) = &self.marker_send {
            out.push_str(&format!("MarkerSend: {}\r\n", marker));
        }
        for (suffix, value) in &self.passthru {
            out.push_str(&format!("X-SSTP-PassThru-{}: {}\r\n", suffix, value));
        }
        out.push_str("\r\n");
        out
    }
}

fn key_str_prefix(key: &str) -> Option<String> {
    let key = key.strip_prefix("X-SSTP-PassThru-")?;
    Some(key.to_string())
}

fn push_continuation(res: &mut ShioriResponse, mode: Option<&str>, line: &str) {
    match mode {
        Some("value") => {
            if let Some(v) = res.value.take() {
                res.value = Some(format!("{}\n{}", v, line));
            }
        }
        Some("value_notify") => {
            if let Some(v) = res.value_notify.take() {
                res.value_notify = Some(format!("{}\n{}", v, line));
            }
        }
        _ => {}
    }
}

fn is_header_key(key: &str) -> bool {
    !key.is_empty()
        && key
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_')
}

/// 複数行値を持つヘッダを書き出す（1行目 `Name: 先頭行`、以後は無印継続行）
fn write_multiline_header(out: &mut String, name: &str, value: &str) {
    let mut lines = value.split('\n');
    if let Some(first) = lines.next() {
        out.push_str(&format!("{}: {}\r\n", name, first));
    }
    for line in lines {
        out.push_str(line);
        out.push_str("\r\n");
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_build_request_ukadoc_sample() {
        // ukadoc サンプル（の内容一式）相当： SecurityLevel は ID より前
        let req = ShioriRequest {
            method: ShioriMethod::Get,
            charset: "UTF-8".into(),
            sender: "SSP".into(),
            sender_type: parse_sender_types("internal,raise"),
            security_level: Some(SecurityLevel::Local),
            security_origin: Some(None),
            status: GhostStatusToken::parse_list("choosing,balloon(0=0)"),
            id: "OnFirstBoot".into(),
            base_id: Some("OnBoot".into()),
            references: vec!["1".into()],
            passthru: Default::default(),
        };
        let text = req.build();

        // 構造確認（行集合として一致させる）
        assert!(text.contains("GET SHIORI/3.0\r\n"));
        assert!(text.contains("SenderType: internal,raise\r\n"));
        assert!(text.contains("SecurityLevel: local\r\n"));
        assert!(text.contains("SecurityOrigin: null\r\n"));
        assert!(text.contains("Status: choosing,balloon(0=0)\r\n"));
        assert!(text.contains("BaseID: OnBoot\r\n"));
        assert!(text.contains("ID: OnFirstBoot\r\n"));
        assert!(text.contains("Reference0: 1\r\n"));
        assert!(text.ends_with("\r\n\r\n"));

        // SecurityLevel は ID 行より前に出る
        let sec_pos = text.find("SecurityLevel").unwrap();
        let id_pos = text.find("ID: OnFirstBoot").unwrap();
        assert!(sec_pos < id_pos);

        // サンプル相当のリクエストをラウンドトリップ
        let parsed = ShioriRequest::parse(&text).unwrap();
        assert_eq!(parsed.method, ShioriMethod::Get);
        assert_eq!(parsed.sender, "SSP");
        assert_eq!(
            parsed.sender_type,
            vec![SenderTypeTag::Internal, SenderTypeTag::Raise]
        );
        assert_eq!(parsed.security_level, Some(SecurityLevel::Local));
        assert_eq!(parsed.security_origin, Some(Option::<String>::None));
        assert_eq!(
            parsed.status,
            vec![
                GhostStatusToken::Choosing,
                GhostStatusToken::Balloon(vec![(0, 0)])
            ]
        );
        assert_eq!(parsed.id, "OnFirstBoot");
        assert_eq!(parsed.base_id.as_deref(), Some("OnBoot"));
        assert_eq!(parsed.references, vec!["1".to_string()]);
    }

    #[test]
    fn test_parse_request_passthru_and_notify() {
        let text = "NOTIFY SHIORI/3.0\r\nCharset: UTF-8\r\nSender: NanaiAndroidMascot\r\nID: OnSecondChange\r\nReference0: 5\r\nX-SSTP-PassThru-Custom: sample\r\n\r\n";
        let req = ShioriRequest::parse(text).unwrap();
        assert_eq!(req.method, ShioriMethod::Notify);
        assert_eq!(req.id, "OnSecondChange");
        assert_eq!(req.references.len(), 1);
        assert_eq!(
            req.passthru.get("Custom").map(String::as_str),
            Some("sample")
        );
        assert_eq!(req.build(), text, "パース→ビルドで逐次一致する");
    }

    #[test]
    fn test_response_status_codes() {
        assert_eq!(StatusCode::parse(200), StatusCode::Ok);
        assert_eq!(StatusCode::parse(204), StatusCode::NoContent);
        assert_eq!(StatusCode::parse(311), StatusCode::NotEnough);
        assert_eq!(StatusCode::parse(312), StatusCode::Advice);
        assert_eq!(StatusCode::parse(400), StatusCode::BadRequest);
        assert_eq!(StatusCode::parse(500), StatusCode::InternalError);
        assert_eq!(StatusCode::parse(599), StatusCode::Other(599));
        assert_eq!(StatusCode::Ok.code(), 200);
        assert_eq!(StatusCode::NoContent.text(), "No Content");
        assert_eq!(StatusCode::NotEnough.text(), "Not Enough");
        assert_eq!(StatusCode::Advice.text(), "Advice");
    }

    #[test]
    fn test_parse_response_ok_with_multiline_value() {
        // 複数行 Value の継続行連結
        let text =
            "SHIORI/3.0 200 OK\r\nCharset: UTF-8\r\nSender: AYA\r\nValue: line1\r\nline2\r\n\r\n";
        let res = ShioriResponse::parse(text).unwrap();
        assert_eq!(res.status, StatusCode::Ok);
        assert_eq!(res.sender.as_deref(), Some("AYA"));
        assert_eq!(res.value.as_deref(), Some("line1\nline2"));

        let built = res.build();
        assert!(built.starts_with("SHIORI/3.0 200 OK\r\n"));
        assert!(built.contains("Value: line1\r\n"));
        assert!(built.contains("line2\r\n"));
        assert!(built.ends_with("\r\n\r\n"));

        // ラウンドトリップは再パース可能
        let back = ShioriResponse::parse(&built).unwrap();
        assert_eq!(back.value.as_deref(), Some("line1\nline2"));
    }

    #[test]
    fn test_parse_response_extensions() {
        let text = "SHIORI/3.0 500 Internal Server Error\r\nErrorLevel: error\u{1}warning\r\nErrorDescription: 記述ミス\u{1}文法注意\r\nBalloonOffset: 10,-5\r\n\r\n";
        let res = ShioriResponse::parse(text).unwrap();
        assert_eq!(res.status, StatusCode::InternalError);
        assert_eq!(
            res.error_level,
            vec![ErrorLevel::Error, ErrorLevel::Warning]
        );
        assert_eq!(res.error_description, vec!["記述ミス", "文法注意"]);
        assert_eq!(res.balloon_offset, Some((10, -5)));
        assert!(res.build().contains("ErrorLevel: error\u{1}warning\r\n"));
        assert!(res.build().contains("BalloonOffset: 10,-5\r\n"));
    }

    #[test]
    fn test_parse_response_communicate() {
        let text = "SHIORI/3.0 200 OK\r\nReference0: ghostA\r\nReference1: 返信本文\r\nAge: 1\r\nMarkerSend: processing\r\nX-SSTP-PassThru-Post: applied\r\n\r\n";
        let res = ShioriResponse::parse(text).unwrap();
        assert_eq!(res.reference0.as_deref(), Some("ghostA"));
        assert_eq!(res.references, vec!["返信本文".to_string()]);
        assert_eq!(res.age, Some(1));
        assert_eq!(res.marker_send.as_deref(), Some("processing"));
        assert_eq!(
            res.passthru.get("Post").map(String::as_str),
            Some("applied")
        );

        let built = res.build();
        assert!(built.contains("Reference0: ghostA\r\n"));
        assert!(built.contains("Reference1: 返信本文\r\n"));
        assert!(built.contains("Age: 1\r\n"));
        assert!(built.contains("MarkerSend: processing\r\n"));
        assert!(built.contains("X-SSTP-PassThru-Post: applied\r\n"));
    }

    #[test]
    fn test_response_no_content() {
        let text = ShioriResponse::no_content().build();
        assert!(text.starts_with("SHIORI/3.0 204 No Content\r\n"));
        let parsed = ShioriResponse::parse(&text).unwrap();
        assert_eq!(parsed.status, StatusCode::NoContent);
        assert!(parsed.value.is_none());

        let empty = ShioriResponse::parse("").unwrap_err();
        assert!(!empty.is_empty());
    }

    #[test]
    fn test_response_teach_pending() {
        // 311 Not Enough / 312 Advice: OnTeach の追加情報要求
        let not_enough = ShioriResponse::parse(
            "SHIORI/3.0 311 Not Enough\r\n\r\n",
        )
        .unwrap();
        assert!(not_enough.is_teach_pending());

        let advice =
            ShioriResponse::parse("SHIORI/3.0 312 Advice\r\n\r\n").unwrap();
        assert!(advice.is_teach_pending());

        assert!(!ShioriResponse::ok("script").is_teach_pending());
        assert!(!ShioriResponse::no_content().is_teach_pending());
    }
}
