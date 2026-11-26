//! SSTP プロパティ・Cookie・パス取得コマンド処理モジュール

use super::super::super::config::SstpGhostContext;
use super::super::super::message::SstpResponse;

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
                    .property(prop_name)
                    .or_else(|| ctx.property(&prop_name.to_lowercase()))
                    .unwrap_or_default()
                    .to_string();
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
                    .cookie(ctx.sender(), cookie_name)
                    .unwrap_or_default()
                    .to_string();
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
            let ghost_target = args.first().map(|s| s.as_str()).unwrap_or(ctx.name());
            let path = ctx
                .property(&format!("ghost.{}.path", ghost_target.to_lowercase()))
                .or_else(|| ctx.property("ghostpath"))
                .unwrap_or_default()
                .to_string();
            Some(SstpResponse::ok(None).with_additional_data(path))
        }
        "getshellpath" => {
            if let Err(err_resp) = check_remote_prohibited() {
                return Some(*err_resp);
            }
            let shell_target = args.first().map(|s| s.as_str()).unwrap_or(ctx.shell_name());
            let path = ctx
                .property(&format!("shell.{}.path", shell_target.to_lowercase()))
                .or_else(|| ctx.property("shellpath"))
                .unwrap_or_default()
                .to_string();
            Some(SstpResponse::ok(None).with_additional_data(path))
        }
        "getballoonpath" => {
            if let Err(err_resp) = check_remote_prohibited() {
                return Some(*err_resp);
            }
            let balloon_target = args
                .first()
                .map(|s| s.as_str())
                .unwrap_or(ctx.balloon_name());
            let path = ctx
                .property(&format!("balloon.{}.path", balloon_target.to_lowercase()))
                .or_else(|| ctx.property("balloonpath"))
                .unwrap_or_default()
                .to_string();
            Some(SstpResponse::ok(None).with_additional_data(path))
        }
        _ => None,
    }
}
