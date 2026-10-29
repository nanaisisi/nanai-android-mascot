//! SHIORI/3.0 レスポンスの型・コンストラクタ・パース補助関数

use crate::shiori::types::*;

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

pub mod build;
pub mod parse;

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
        matches!(self.status, StatusCode::NotEnough | StatusCode::Advice)
    }
}

pub(super) fn key_str_prefix(key: &str) -> Option<String> {
    let key = key.strip_prefix("X-SSTP-PassThru-")?;
    Some(key.to_string())
}

pub(super) fn push_continuation(res: &mut ShioriResponse, mode: Option<&str>, line: &str) {
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

pub(super) fn is_header_key(key: &str) -> bool {
    !key.is_empty()
        && key
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_')
}

pub(super) fn write_multiline_header(out: &mut String, name: &str, value: &str) {
    let mut lines = value.split('\n');
    let first = lines.next().unwrap_or("");
    out.push_str(&format!("{}: {}\r\n", name, first));
    for line in lines {
        out.push_str(line);
        out.push_str("\r\n");
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_shiori_response_constructors() {
        let no_cont = ShioriResponse::no_content();
        assert_eq!(no_cont.status, StatusCode::NoContent);
        assert!(!no_cont.is_teach_pending());

        let ok_res = ShioriResponse::ok("\\hHello");
        assert_eq!(ok_res.status, StatusCode::Ok);
        assert_eq!(ok_res.value.as_deref(), Some("\\hHello"));
        assert!(!ok_res.is_teach_pending());

        let mut teach_res = ShioriResponse::default();
        teach_res.status = StatusCode::NotEnough;
        assert!(teach_res.is_teach_pending());
        teach_res.status = StatusCode::Advice;
        assert!(teach_res.is_teach_pending());
    }

    #[test]
    fn test_response_helpers() {
        assert_eq!(key_str_prefix("X-SSTP-PassThru-CustomKey"), Some("CustomKey".to_string()));
        assert_eq!(key_str_prefix("InvalidKey"), None);

        assert!(is_header_key("X-Header-Name_1"));
        assert!(!is_header_key("Invalid Header"));
        assert!(!is_header_key(""));

        let mut res = ShioriResponse::ok("Line1");
        push_continuation(&mut res, Some("value"), "Line2");
        assert_eq!(res.value.as_deref(), Some("Line1\nLine2"));

        let mut res_notify = ShioriResponse::ok("Notify1");
        res_notify.value_notify = Some("Notify1".to_string());
        push_continuation(&mut res_notify, Some("value_notify"), "Notify2");
        assert_eq!(res_notify.value_notify.as_deref(), Some("Notify1\nNotify2"));

        push_continuation(&mut res_notify, Some("unknown"), "Ignored");

        let mut res_none = ShioriResponse::default();
        push_continuation(&mut res_none, Some("value"), "Ignored");
        push_continuation(&mut res_none, Some("value_notify"), "Ignored");

        let mut out = String::new();
        write_multiline_header(&mut out, "Header", "Line1\nLine2");
        assert!(out.contains("Header: Line1"));
        assert!(out.contains("Line2"));
    }
}
