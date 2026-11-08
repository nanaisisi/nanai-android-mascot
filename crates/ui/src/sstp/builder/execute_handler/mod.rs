//! SSTP EXECUTE コマンド処理モジュール

pub mod actions;
pub mod properties;
pub mod queries;

use actions::handle_action_commands;
use properties::handle_property_cookie_commands;
use queries::handle_query_commands;

use crate::sstp::config::SstpGhostContext;
use crate::sstp::message::SstpResponse;

/// EXECUTE コマンドを処理して適切な SstpResponse を生成する
pub fn handle_execute_command(command_str: &str, ctx: &SstpGhostContext) -> SstpResponse {
    let cmd = command_str.trim();
    let (cmd_name, raw_args) = if let Some((name, rest)) = cmd.split_once('[') {
        (name.trim(), rest.trim_end_matches(']').trim())
    } else {
        (cmd, "")
    };

    // 引数の取得：大かっこ内パラメータを優先し、空の場合は Reference0〜 から解決 (UKADOC method_execute.md)
    let mut args: Vec<String> = if raw_args.is_empty() {
        Vec::new()
    } else {
        raw_args.split(',').map(|s| s.trim().to_string()).collect()
    };

    if args.is_empty() {
        let mut idx = 0;
        while let Some(val) = ctx.references.get(&format!("Reference{}", idx)) {
            args.push(val.clone());
            idx += 1;
        }
    }

    // リモート不可判定ヘルパー
    let is_remote = ctx
        .security_level
        .as_deref()
        .map(|s| s.eq_ignore_ascii_case("external"))
        .unwrap_or(false);

    let check_remote_prohibited = || -> Result<(), Box<SstpResponse>> {
        if is_remote {
            Err(Box::new(
                SstpResponse::refuse().with_error_description("command prohibited from remote"),
            ))
        } else {
            Ok(())
        }
    };

    let norm_cmd = cmd_name.to_lowercase();

    if let Some(res) = handle_query_commands(&norm_cmd, ctx, is_remote) {
        return res;
    }

    if let Some(res) =
        handle_property_cookie_commands(&norm_cmd, &args, ctx, &check_remote_prohibited)
    {
        return res;
    }

    if let Some(res) = handle_action_commands(&norm_cmd, &args, &check_remote_prohibited) {
        return res;
    }

    SstpResponse::bad_request().with_error_description("unknown command")
}
