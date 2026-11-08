//! SSTP プロパティ・Cookie・パス取得コマンド処理モジュール

use crate::sstp::config::SstpGhostContext;
use crate::sstp::message::SstpResponse;

/// プロパティ・Cookie・パス関連コマンドをハンドリングする
pub(super) fn handle_property_cookie_commands(
    cmd_name: &str,
    args: &[String],
    ctx: &SstpGhostContext,
    check_remote_prohibited: &impl Fn() -> Result<(), Box<SstpResponse>>,
) -> Option<SstpResponse> {
    match cmd_name {
        "getproperty" => {
            let prop_name = args.first().map(|s| s.as_str()).unwrap_or("");
            if prop_name.is_empty() {
                Some(SstpResponse::bad_request().with_error_description("missing property name"))
            } else {
                let val = ctx
                    .properties
                    .get(prop_name)
                    .or_else(|| ctx.properties.get(&prop_name.to_lowercase()))
                    .cloned()
                    .unwrap_or_default();
                Some(SstpResponse::ok(None).with_additional_data(val))
            }
        }
        "setproperty" => {
            if let Err(err_resp) = check_remote_prohibited() {
                return Some(*err_resp);
            }
            if args.is_empty() {
                Some(SstpResponse::bad_request().with_error_description("missing property name"))
            } else {
                Some(SstpResponse::ok(None))
            }
        }
        "getcookie" => {
            let cookie_name = args.first().map(|s| s.as_str()).unwrap_or("");
            if cookie_name.is_empty() {
                Some(SstpResponse::bad_request().with_error_description("missing cookie name"))
            } else {
                let val = ctx
                    .cookies
                    .get(&ctx.sender)
                    .and_then(|m| m.get(cookie_name))
                    .cloned()
                    .unwrap_or_default();
                Some(SstpResponse::ok(None).with_additional_data(val))
            }
        }
        "setcookie" => {
            if args.is_empty() {
                Some(SstpResponse::bad_request().with_error_description("missing cookie name"))
            } else {
                Some(SstpResponse::ok(None))
            }
        }
        "getghostpath" => {
            if let Err(err_resp) = check_remote_prohibited() {
                return Some(*err_resp);
            }
            let ghost_target = args.first().map(|s| s.as_str()).unwrap_or(&ctx.name);
            let path = ctx
                .properties
                .get(&format!("ghost.{}.path", ghost_target.to_lowercase()))
                .or_else(|| ctx.properties.get("ghostpath"))
                .cloned()
                .unwrap_or_default();
            Some(SstpResponse::ok(None).with_additional_data(path))
        }
        "getshellpath" => {
            if let Err(err_resp) = check_remote_prohibited() {
                return Some(*err_resp);
            }
            let shell_target = args.first().map(|s| s.as_str()).unwrap_or(&ctx.shell_name);
            let path = ctx
                .properties
                .get(&format!("shell.{}.path", shell_target.to_lowercase()))
                .or_else(|| ctx.properties.get("shellpath"))
                .cloned()
                .unwrap_or_default();
            Some(SstpResponse::ok(None).with_additional_data(path))
        }
        "getballoonpath" => {
            if let Err(err_resp) = check_remote_prohibited() {
                return Some(*err_resp);
            }
            let balloon_target = args
                .first()
                .map(|s| s.as_str())
                .unwrap_or(&ctx.balloon_name);
            let path = ctx
                .properties
                .get(&format!("balloon.{}.path", balloon_target.to_lowercase()))
                .or_else(|| ctx.properties.get("balloonpath"))
                .cloned()
                .unwrap_or_default();
            Some(SstpResponse::ok(None).with_additional_data(path))
        }
        _ => None,
    }
}
