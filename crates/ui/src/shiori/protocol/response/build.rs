//! SHIORI/3.0 レスポンスのテキスト生成実装

use super::ShioriResponse;
use super::write_multiline_header;
use crate::shiori::types::*;

impl ShioriResponse {
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_shiori_response_build_full() {
        let mut res = ShioriResponse::ok("\\hHello");
        res.status = StatusCode::Other(999);
        res.sender = Some("TestSender".into());
        res.value_notify = Some("NotifyScript".into());
        res.security_level = Some(SecurityLevel::Local);
        res.marker = Some("MarkerVal".into());
        res.error_level = vec![ErrorLevel::Warning];
        res.error_description = vec!["WarnDesc".into()];
        res.balloon_offset = Some((10, 20));
        res.reference0 = Some("Ref0Val".into());
        res.references = vec!["Ref1Val".into()];
        res.age = Some(1);
        res.marker_send = Some("SendMarker".into());
        res.passthru.insert("PassKey".into(), "PassVal".into());

        let built = res.build();
        assert!(built.contains("SHIORI/3.0 999"));
        assert!(built.contains("Sender: TestSender"));
        assert!(built.contains("ValueNotify: NotifyScript"));
        assert!(built.contains("SecurityLevel: local"));
        assert!(built.contains("Marker: MarkerVal"));
        assert!(built.contains("ErrorLevel: warning"));
        assert!(built.contains("ErrorDescription: WarnDesc"));
        assert!(built.contains("BalloonOffset: 10,20"));
        assert!(built.contains("Reference0: Ref0Val"));
        assert!(built.contains("Reference1: Ref1Val"));
        assert!(built.contains("Age: 1"));
        assert!(built.contains("MarkerSend: SendMarker"));
        assert!(built.contains("X-SSTP-PassThru-PassKey: PassVal"));
    }
}
