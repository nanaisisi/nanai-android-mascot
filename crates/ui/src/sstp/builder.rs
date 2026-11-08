use crate::sstp::config::SstpGhostContext;
use crate::sstp::message::SstpResponse;
use std::collections::HashMap;

/// SSTP イベント（SHIORI イベント OnSSTPBreak, OnSSTPBlacklisting 等）生成ビルダー
pub struct SstpEventBuilder;

impl SstpEventBuilder {
    /// OnSSTPBreak イベントリクエストのパラメータを構築
    /// Reference0: 中断の操作が起きたスクリプト
    /// Reference1: 中断の操作が起きたバルーンのスコープ番号 (本体側0、相方側1)
    /// Reference2: 中断位置 (スクリプト先頭からの文字数)
    pub fn build_on_sstp_break(
        script: &str,
        scope: u32,
        break_pos: usize,
    ) -> HashMap<String, String> {
        let mut refs = HashMap::new();
        refs.insert("ID".to_string(), "OnSSTPBreak".to_string());
        refs.insert("Reference0".to_string(), script.to_string());
        refs.insert("Reference1".to_string(), scope.to_string());
        refs.insert("Reference2".to_string(), break_pos.to_string());
        refs
    }

    /// OnSSTPBlacklisting イベントリクエストのパラメータを構築
    /// Reference0: 最終クライアントのIPアドレス
    pub fn build_on_sstp_blacklisting(client_ip: &str) -> HashMap<String, String> {
        let mut refs = HashMap::new();
        refs.insert("ID".to_string(), "OnSSTPBlacklisting".to_string());
        refs.insert("Reference0".to_string(), client_ip.to_string());
        refs
    }
}

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

    match cmd_name.to_lowercase().as_str() {
        "getname" => {
            let data = format!("{},{}", ctx.sakura_name, ctx.kero_name);
            SstpResponse::ok(None).with_additional_data(data)
        }
        "getnames" => {
            let data = ctx.installed_ghosts.join("\r\n");
            SstpResponse::ok(None).with_additional_data(data)
        }
        "getghostname" => SstpResponse::ok(None).with_additional_data(ctx.name.clone()),
        "getshellname" => SstpResponse::ok(None).with_additional_data(ctx.shell_name.clone()),
        "getballoonname" => SstpResponse::ok(None).with_additional_data(ctx.balloon_name.clone()),
        "getghostnamelist" => {
            let data = ctx.installed_ghosts.join("\r\n");
            SstpResponse::ok(None).with_additional_data(data)
        }
        "getshellnamelist" => {
            let data = ctx.installed_shells.join("\r\n");
            SstpResponse::ok(None).with_additional_data(data)
        }
        "getballoonnamelist" => {
            let data = ctx.installed_balloons.join("\r\n");
            SstpResponse::ok(None).with_additional_data(data)
        }
        "getheadlinenamelist" => {
            let data = ctx.installed_headlines.join("\r\n");
            SstpResponse::ok(None).with_additional_data(data)
        }
        "getpluginnamelist" => {
            let data = ctx.installed_plugins.join("\r\n");
            SstpResponse::ok(None).with_additional_data(data)
        }
        "getversion" => SstpResponse::ok(None).with_additional_data(ctx.version.clone()),
        "getshortversion" => SstpResponse::ok(None).with_additional_data(ctx.short_version.clone()),
        "getstatus" => {
            if ctx.status.is_empty() {
                SstpResponse::ok(None)
            } else {
                SstpResponse::ok(None).with_additional_data(ctx.status.clone())
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
            SstpResponse::ok(None).with_additional_data(fmo_data)
        }
        "getproperty" => {
            let prop_name = args.first().map(|s| s.as_str()).unwrap_or("");
            if prop_name.is_empty() {
                SstpResponse::bad_request().with_error_description("missing property name")
            } else {
                let val = ctx
                    .properties
                    .get(prop_name)
                    .or_else(|| ctx.properties.get(&prop_name.to_lowercase()))
                    .cloned()
                    .unwrap_or_default();
                SstpResponse::ok(None).with_additional_data(val)
            }
        }
        "setproperty" => {
            if let Err(err_resp) = check_remote_prohibited() {
                return *err_resp;
            }
            if args.is_empty() {
                SstpResponse::bad_request().with_error_description("missing property name")
            } else {
                SstpResponse::ok(None)
            }
        }
        "getcookie" => {
            let cookie_name = args.first().map(|s| s.as_str()).unwrap_or("");
            if cookie_name.is_empty() {
                SstpResponse::bad_request().with_error_description("missing cookie name")
            } else {
                let val = ctx
                    .cookies
                    .get(&ctx.sender)
                    .and_then(|m| m.get(cookie_name))
                    .cloned()
                    .unwrap_or_default();
                SstpResponse::ok(None).with_additional_data(val)
            }
        }
        "setcookie" => {
            if args.is_empty() {
                SstpResponse::bad_request().with_error_description("missing cookie name")
            } else {
                SstpResponse::ok(None)
            }
        }
        "quiet" | "restore" => {
            if let Err(err_resp) = check_remote_prohibited() {
                return *err_resp;
            }
            SstpResponse::ok(None)
        }
        "dumpsurface" | "moveasync" | "settrayicon" | "settrayballoon" => {
            if let Err(err_resp) = check_remote_prohibited() {
                return *err_resp;
            }
            SstpResponse::ok(None)
        }
        "compressarchive" | "extractarchive" => {
            if let Err(err_resp) = check_remote_prohibited() {
                return *err_resp;
            }
            if args.len() < 2 {
                SstpResponse::bad_request().with_error_description("missing archive paths")
            } else {
                SstpResponse::ok(None)
            }
        }
        "compact" | "cleansurface" => {
            // メモリ圧縮およびサーフィスキャッシュ解放 (UKADOC/SSP EXECUTE 規格準拠)
            if let Err(err_resp) = check_remote_prohibited() {
                return *err_resp;
            }
            SstpResponse::ok(None)
        }
        "getghostpath" => {
            if let Err(err_resp) = check_remote_prohibited() {
                return *err_resp;
            }
            let ghost_target = args.first().map(|s| s.as_str()).unwrap_or(&ctx.name);
            let path = ctx
                .properties
                .get(&format!("ghost.{}.path", ghost_target.to_lowercase()))
                .or_else(|| ctx.properties.get("ghostpath"))
                .cloned()
                .unwrap_or_default();
            SstpResponse::ok(None).with_additional_data(path)
        }
        "getshellpath" => {
            if let Err(err_resp) = check_remote_prohibited() {
                return *err_resp;
            }
            let shell_target = args.first().map(|s| s.as_str()).unwrap_or(&ctx.shell_name);
            let path = ctx
                .properties
                .get(&format!("shell.{}.path", shell_target.to_lowercase()))
                .or_else(|| ctx.properties.get("shellpath"))
                .cloned()
                .unwrap_or_default();
            SstpResponse::ok(None).with_additional_data(path)
        }
        "getballoonpath" => {
            if let Err(err_resp) = check_remote_prohibited() {
                return *err_resp;
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
            SstpResponse::ok(None).with_additional_data(path)
        }
        _ => SstpResponse::bad_request().with_error_description("unknown command"),
    }
}
