/**
 * @file methods_codes_responses.rs
 * @brief SstpMethod, SstpStatusCode, SstpResponse ヘルパー構築単体テスト
 */

use super::*;

#[test]
fn test_sstp_method_parsing_and_as_str() {
    assert_eq!(SstpMethod::parse("SEND"), Some(SstpMethod::Send));
    assert_eq!(SstpMethod::parse("notify"), Some(SstpMethod::Notify));
    assert_eq!(SstpMethod::parse("EXECUTE"), Some(SstpMethod::Execute));
    assert_eq!(
        SstpMethod::parse("COMMUNICATE"),
        Some(SstpMethod::Communicate)
    );
    assert_eq!(SstpMethod::parse("give"), Some(SstpMethod::Give));
    assert_eq!(SstpMethod::parse("UNKNOWN"), None);

    assert_eq!(SstpMethod::Send.as_str(), "SEND");
    assert_eq!(SstpMethod::Notify.as_str(), "NOTIFY");
    assert_eq!(SstpMethod::Execute.as_str(), "EXECUTE");
    assert_eq!(SstpMethod::Communicate.as_str(), "COMMUNICATE");
    assert_eq!(SstpMethod::Give.as_str(), "GIVE");
}

#[test]
fn test_sstp_status_codes() {
    assert_eq!(SstpStatusCode::Ok.code(), 200);
    assert_eq!(SstpStatusCode::Ok.reason_phrase(), "OK");
    assert_eq!(SstpStatusCode::NoContent.code(), 204);
    assert_eq!(SstpStatusCode::NoContent.reason_phrase(), "No Content");
    assert_eq!(SstpStatusCode::BadRequest.code(), 400);
    assert_eq!(SstpStatusCode::BadRequest.reason_phrase(), "Bad Request");
    assert_eq!(SstpStatusCode::NotFound.code(), 404);
    assert_eq!(SstpStatusCode::NotFound.reason_phrase(), "Not Found");
    assert_eq!(SstpStatusCode::Conflict.code(), 409);
    assert_eq!(SstpStatusCode::Conflict.reason_phrase(), "Conflict");
    assert_eq!(SstpStatusCode::Break.code(), 210);
    assert_eq!(SstpStatusCode::Break.reason_phrase(), "Break");
    assert_eq!(SstpStatusCode::RequestTimeout.code(), 408);
    assert_eq!(
        SstpStatusCode::RequestTimeout.reason_phrase(),
        "Request Timeout"
    );
    assert_eq!(SstpStatusCode::PayloadTooLarge.code(), 413);
    assert_eq!(
        SstpStatusCode::PayloadTooLarge.reason_phrase(),
        "Payload Too Large"
    );
    assert_eq!(SstpStatusCode::Refuse.code(), 420);
    assert_eq!(SstpStatusCode::Refuse.reason_phrase(), "Refuse");
    assert_eq!(SstpStatusCode::InternalServerError.code(), 500);
    assert_eq!(
        SstpStatusCode::InternalServerError.reason_phrase(),
        "Internal Server Error"
    );
    assert_eq!(SstpStatusCode::NotImplemented.code(), 501);
    assert_eq!(
        SstpStatusCode::NotImplemented.reason_phrase(),
        "Not Implemented"
    );
    assert_eq!(SstpStatusCode::ServiceUnavailable.code(), 503);
    assert_eq!(
        SstpStatusCode::ServiceUnavailable.reason_phrase(),
        "Service Unavailable"
    );
    assert_eq!(SstpStatusCode::VersionNotSupported.code(), 505);
    assert_eq!(
        SstpStatusCode::VersionNotSupported.reason_phrase(),
        "Version Not Supported"
    );
    assert_eq!(SstpStatusCode::Invisible.code(), 512);
    assert_eq!(SstpStatusCode::Invisible.reason_phrase(), "Invisible");
}

#[test]
fn test_sstp_response_helpers_and_additional_data_formatting() {
    let nc = SstpResponse::no_content();
    assert_eq!(nc.status, SstpStatusCode::NoContent);

    let bad = SstpResponse::bad_request();
    assert_eq!(bad.status, SstpStatusCode::BadRequest);

    let not_found = SstpResponse::not_found();
    assert_eq!(not_found.status, SstpStatusCode::NotFound);

    let server_err = SstpResponse::internal_server_error();
    assert_eq!(server_err.status, SstpStatusCode::InternalServerError);

    let mut res_without_trailing_newline = SstpResponse::ok(None);
    res_without_trailing_newline.additional_data = Some("single line data".to_string());
    let built = res_without_trailing_newline.build();
    assert!(built.contains("single line data\r\n\r\n"));

    let err_res = SstpResponse::bad_request().with_error_description("custom error");
    assert!(
        err_res
            .build()
            .contains("ErrorDescription: custom error\r\n")
    );
}
