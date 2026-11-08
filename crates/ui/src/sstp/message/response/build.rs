//! SSTP レスポンス文字列構築（フォーマット）モジュール

use super::SstpResponse;

impl SstpResponse {
    /// SSTP レスポンス文字列を構築する (UKADOC req_res / keepalive 準拠)
    pub fn build(&self) -> String {
        let mut out = format!(
            "{} {} {}\r\n",
            self.version,
            self.status.code(),
            self.status.reason_phrase()
        );
        out.push_str(&format!("Charset: {}\r\n", self.charset));

        if let Some(ref conn) = self.connection_header {
            out.push_str(&format!("Connection: {}\r\n", conn));
            if conn.eq_ignore_ascii_case("keep-alive") {
                out.push_str(&format!(
                    "Keep-Alive: timeout={}\r\n",
                    self.keep_alive_timeout
                ));
            }
        }

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

        // Keep-Alive 時の Content-Length ヘッダ (UKADOC keepalive.md 規格準拠)
        if self.keep_alive
            && self.connection_header.as_deref() == Some("keep-alive")
            && let Some(ref data) = self.additional_data
        {
            out.push_str(&format!("Content-Length: {}\r\n", data.len()));
            out.push_str("\r\n");
            out.push_str(data);
            // keepalive 時は追加データ後ろに空行を付けない
            return out;
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
