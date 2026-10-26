//! SHIORI/3.0 リクエストおよびレスポンスの構築・パース処理

use super::types::*;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

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
                "x-sstp-passthru-markersend" => {}
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
            match line.split_once(':') {
                Some((key, value)) => {
                    let key_ok = !key.trim().contains(char::is_whitespace)
                        || key.trim().starts_with("X-SSTP-");
                    if !key_ok && !is_header_key(key) {
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
                        "markererror" => {}
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
