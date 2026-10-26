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

pub mod protocol;
pub mod types;

pub use protocol::{ShioriRequest, ShioriResponse};
pub use types::{
    ErrorLevel, GhostStatusToken, SecurityLevel, SenderTypeTag, ShioriMethod, StatusCode,
    parse_sender_types,
};

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_build_request_ukadoc_sample() {
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

        assert!(text.contains("GET SHIORI/3.0\r\n"));
        assert!(text.contains("SenderType: internal,raise\r\n"));
        assert!(text.contains("SecurityLevel: local\r\n"));
        assert!(text.contains("SecurityOrigin: null\r\n"));
        assert!(text.contains("Status: choosing,balloon(0=0)\r\n"));
        assert!(text.contains("BaseID: OnBoot\r\n"));
        assert!(text.contains("ID: OnFirstBoot\r\n"));
        assert!(text.contains("Reference0: 1\r\n"));
        assert!(text.ends_with("\r\n\r\n"));

        let sec_pos = text.find("SecurityLevel").unwrap();
        let id_pos = text.find("ID: OnFirstBoot").unwrap();
        assert!(sec_pos < id_pos);

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
