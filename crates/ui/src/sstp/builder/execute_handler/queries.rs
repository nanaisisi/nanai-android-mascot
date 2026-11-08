//! SSTP 名前・バージョン・ステータス・FMO 情報取得コマンド処理モジュール

use crate::sstp::config::SstpGhostContext;
use crate::sstp::message::SstpResponse;

/// 名前・バージョン・ステータス・FMO などの情報取得コマンドをハンドリングする
pub(super) fn handle_query_commands(
    cmd_name: &str,
    ctx: &SstpGhostContext,
    is_remote: bool,
) -> Option<SstpResponse> {
    match cmd_name {
        "getname" => {
            let data = format!("{},{}", ctx.sakura_name, ctx.kero_name);
            Some(SstpResponse::ok(None).with_additional_data(data))
        }
        "getnames" => {
            let data = ctx.installed_ghosts.join("\r\n");
            Some(SstpResponse::ok(None).with_additional_data(data))
        }
        "getghostname" => Some(SstpResponse::ok(None).with_additional_data(ctx.name.clone())),
        "getshellname" => Some(SstpResponse::ok(None).with_additional_data(ctx.shell_name.clone())),
        "getballoonname" => Some(SstpResponse::ok(None).with_additional_data(ctx.balloon_name.clone())),
        "getghostnamelist" => {
            let data = ctx.installed_ghosts.join("\r\n");
            Some(SstpResponse::ok(None).with_additional_data(data))
        }
        "getshellnamelist" => {
            let data = ctx.installed_shells.join("\r\n");
            Some(SstpResponse::ok(None).with_additional_data(data))
        }
        "getballoonnamelist" => {
            let data = ctx.installed_balloons.join("\r\n");
            Some(SstpResponse::ok(None).with_additional_data(data))
        }
        "getheadlinenamelist" => {
            let data = ctx.installed_headlines.join("\r\n");
            Some(SstpResponse::ok(None).with_additional_data(data))
        }
        "getpluginnamelist" => {
            let data = ctx.installed_plugins.join("\r\n");
            Some(SstpResponse::ok(None).with_additional_data(data))
        }
        "getversion" => Some(SstpResponse::ok(None).with_additional_data(ctx.version.clone())),
        "getshortversion" => Some(SstpResponse::ok(None).with_additional_data(ctx.short_version.clone())),
        "getstatus" => {
            if ctx.status.is_empty() {
                Some(SstpResponse::ok(None))
            } else {
                Some(SstpResponse::ok(None).with_additional_data(ctx.status.clone()))
            }
        }
        "getfmo" => {
            let fmo_data = if is_remote {
                // リモート時は path, ghostpath を除去し hwnd をダミー化 (UKADOC method_execute.md)
                let lines: Vec<String> = ctx
                    .fmo_text
                    .lines()
                    .filter_map(|line| {
                        if line.contains(".path\x01") || line.contains(".ghostpath\x01") {
                            None
                        } else if line.contains(".hwnd\x01") {
                            let prefix = line.split_once(".hwnd\x01").map(|(p, _)| p).unwrap_or("");
                            Some(format!("{}.hwnd\x01{}", prefix, 0))
                        } else if line.contains(".kerohwnd\x01") {
                            let prefix = line
                                .split_once(".kerohwnd\x01")
                                .map(|(p, _)| p)
                                .unwrap_or("");
                            Some(format!("{}.kerohwnd\x01{}", prefix, 0))
                        } else if line.contains(".hwndlist\x01") {
                            let prefix = line
                                .split_once(".hwndlist\x01")
                                .map(|(p, _)| p)
                                .unwrap_or("");
                            Some(format!("{}.hwndlist\x01{}", prefix, 0))
                        } else {
                            Some(line.to_string())
                        }
                    })
                    .collect();
                lines.join("\r\n")
            } else {
                ctx.fmo_text.clone()
            };
            Some(SstpResponse::ok(None).with_additional_data(fmo_data))
        }
        _ => None,
    }
}
