//! SHIORI/3.0 リクエスト構築処理

use super::types::ShioriRequest;
use crate::shiori::types::*;

impl ShioriRequest {
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
