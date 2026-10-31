//! SHIORI/3.0 レスポンスのパース単体テスト

use super::super::ShioriResponse;
use crate::shiori::types::*;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_protocol_versions_and_case() {
        let text1 = "SHIORI/3.0 200 OK\r\n\r\n";
        let res1 = ShioriResponse::parse(text1).unwrap();
        assert_eq!(res1.status, StatusCode::Ok);

        let text2 = "shiori/2.2 204 No Content\r\n\r\n";
        let res2 = ShioriResponse::parse(text2).unwrap();
        assert_eq!(res2.status, StatusCode::NoContent);

        let text3 = "SHIORI/3.0 599 Custom Status\r\n\r\n";
        let res3 = ShioriResponse::parse(text3).unwrap();
        assert_eq!(res3.status, StatusCode::Other(599));
    }

    #[test]
    fn test_parse_protocol_error_conditions() {
        assert_eq!(
            ShioriResponse::parse("").unwrap_err(),
            "unsupported protocol version: "
        );
        assert_eq!(
            ShioriResponse::parse("HTTP/1.1 200 OK\r\n").unwrap_err(),
            "unsupported protocol version: HTTP/1.1"
        );
        assert_eq!(
            ShioriResponse::parse("SHIORI/3.0").unwrap_err(),
            "missing status code"
        );
        assert_eq!(
            ShioriResponse::parse("SHIORI/3.0 invalid_status").unwrap_err(),
            "missing status code"
        );
    }

    #[test]
    fn test_parse_multiline_value_and_valuenotify() {
        let text = "SHIORI/3.0 200 OK\r\nValue: line1\r\nline2\r\n line3\r\n\r\n";
        let res = ShioriResponse::parse(text).unwrap();
        assert_eq!(res.value.as_deref(), Some("line1\nline2\n line3"));

        let text_vn = "SHIORI/3.0 200 OK\r\nValueNotify: notify1\r\nnotify2\r\n\r\n";
        let res_vn = ShioriResponse::parse(text_vn).unwrap();
        assert_eq!(res_vn.value_notify.as_deref(), Some("notify1\nnotify2"));

        let text_url = "SHIORI/3.0 200 OK\r\nValue: http://example.com:8080/path\r\ncont key: cont val\r\n\r\n";
        let res_url = ShioriResponse::parse(text_url).unwrap();
        assert_eq!(
            res_url.value.as_deref(),
            Some("http://example.com:8080/path\ncont key: cont val")
        );

        let text_unknown = "SHIORI/3.0 200 OK\r\nReference2: r2\r\nReference0: r0\r\nReference1: r1\r\nUnknownHeader: val\r\n\r\n";
        let res_unknown = ShioriResponse::parse(text_unknown).unwrap();
        assert_eq!(
            res_unknown.references,
            vec!["r1".to_string(), "r2".to_string()]
        );

        let text_orphan = "SHIORI/3.0 200 OK\r\nOrphan line\r\nValue: val\r\n\r\n";
        let res_orphan = ShioriResponse::parse(text_orphan).unwrap();
        assert_eq!(res_orphan.value.as_deref(), Some("val"));
    }

    #[test]
    fn test_parse_headers_security_marker_balloon_age() {
        let text = "SHIORI/3.0 200 OK\r\nCharset: Shift_JIS\r\nSender: GhostApp\r\nSecurityLevel: local\r\nMarker: mark1\r\nMarkerSend: mark2\r\nMarkerError: err\r\nBalloonOffset: 12, -4\r\nAge: 5\r\n\r\n";
        let res = ShioriResponse::parse(text).unwrap();
        assert_eq!(res.charset, "Shift_JIS");
        assert_eq!(res.sender.as_deref(), Some("GhostApp"));
        assert_eq!(res.security_level, Some(SecurityLevel::Local));
        assert_eq!(res.marker.as_deref(), Some("mark1"));
        assert_eq!(res.marker_send.as_deref(), Some("mark2"));
        assert_eq!(res.balloon_offset, Some((12, -4)));
        assert_eq!(res.age, Some(5));

        let text_invalid_nums = "SHIORI/3.0 200 OK\r\nBalloonOffset: invalid\r\nAge: abc\r\n\r\n";
        let res_invalid = ShioriResponse::parse(text_invalid_nums).unwrap();
        assert_eq!(res_invalid.balloon_offset, None);
        assert_eq!(res_invalid.age, None);

        let text_partial_offset = "SHIORI/3.0 200 OK\r\nBalloonOffset: x, 10\r\nBalloonOffset: 10, y\r\nBalloonOffset: 10\r\n\r\n";
        let res_partial = ShioriResponse::parse(text_partial_offset).unwrap();
        assert_eq!(res_partial.balloon_offset, None);
    }

    #[test]
    fn test_parse_error_levels_and_descriptions() {
        let text = "SHIORI/3.0 500 Internal Error\r\nErrorLevel: error\u{1}warning\r\nErrorDescription: err_msg\u{1}warn_msg\r\n\r\n";
        let res = ShioriResponse::parse(text).unwrap();
        assert_eq!(
            res.error_level,
            vec![ErrorLevel::Error, ErrorLevel::Warning]
        );
        assert_eq!(res.error_description, vec!["err_msg", "warn_msg"]);
    }

    #[test]
    fn test_parse_references_and_passthru() {
        let text = "SHIORI/3.0 200 OK\r\nReference0: ref0_val\r\nReference1: ref1_val\r\nReference3: ref3_val\r\nReferenceABC: invalid_ref\r\nX-SSTP-PassThru-CustomHeader: custom_val\r\nX-SSTP-PassThru-MarkerSend: skipped_val\r\n\r\n";
        let res = ShioriResponse::parse(text).unwrap();
        assert_eq!(res.reference0.as_deref(), Some("ref0_val"));
        assert_eq!(
            res.references,
            vec![
                "ref1_val".to_string(),
                "".to_string(),
                "ref3_val".to_string()
            ]
        );
        assert_eq!(
            res.passthru.get("CustomHeader").map(String::as_str),
            Some("custom_val")
        );
        assert_eq!(res.passthru.get("MarkerSend"), None);
    }

    #[test]
    fn test_parse_stop_at_empty_line() {
        let text = "SHIORI/3.0 200 OK\r\nSender: First\r\n\r\nSender: Second\r\n";
        let res = ShioriResponse::parse(text).unwrap();
        assert_eq!(res.sender.as_deref(), Some("First"));
    }
}
