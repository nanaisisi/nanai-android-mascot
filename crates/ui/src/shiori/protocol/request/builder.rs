//! SHIORI/3.0 リクエスト構築処理

use super::super::super::types::*;
use super::types::ShioriRequest;

impl ShioriRequest {
    /// CR+LF 終端のリクエストテキストを生成する（末尾は空行 CRLF×2）
    pub fn build(&self) -> String {
        let mut out = String::new();
        self.write_base_headers(&mut out);
        self.write_sender_type_header(&mut out);
        self.write_security_headers(&mut out);
        self.write_status_and_base_headers(&mut out);
        out.push_str(&format!("ID: {}\r\n", self.id));
        write_references(&mut out, &self.references);
        write_passthru(&mut out, &self.passthru);
        out.push_str("\r\n");
        out
    }

    fn write_base_headers(&self, out: &mut String) {
        out.push_str(&format!("{} SHIORI/3.0\r\n", self.method.as_str()));
        out.push_str(&format!("Charset: {}\r\n", self.charset));
        out.push_str(&format!("Sender: {}\r\n", self.sender));
    }

    fn write_sender_type_header(&self, out: &mut String) {
        if !self.sender_type.is_empty() {
            let tokens = self
                .sender_type
                .iter()
                .map(|t| t.token())
                .collect::<Vec<_>>()
                .join(",");
            out.push_str(&format!("SenderType: {}\r\n", tokens));
        }
    }

    fn write_security_headers(&self, out: &mut String) {
        if let Some(level) = &self.security_level {
            out.push_str(&format!("SecurityLevel: {}\r\n", level.as_str()));
        }
        if let Some(origin) = &self.security_origin {
            out.push_str(&format!(
                "SecurityOrigin: {}\r\n",
                origin.as_deref().unwrap_or("null")
            ));
        }
    }

    fn write_status_and_base_headers(&self, out: &mut String) {
        if !self.status.is_empty() {
            out.push_str(&format!(
                "Status: {}\r\n",
                GhostStatusToken::write_tokens(&self.status)
            ));
        }
        if let Some(base) = &self.base_id {
            out.push_str(&format!("BaseID: {}\r\n", base));
        }
    }
}

fn write_references(out: &mut String, references: &[String]) {
    for (i, r) in references.iter().enumerate() {
        out.push_str(&format!("Reference{}: {}\r\n", i, r));
    }
}

fn write_passthru(out: &mut String, passthru: &std::collections::BTreeMap<String, String>) {
    for (suffix, value) in passthru {
        out.push_str(&format!("X-SSTP-PassThru-{}: {}\r\n", suffix, value));
    }
}
