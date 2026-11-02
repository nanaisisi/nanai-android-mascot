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
    let (cmd_name, _args) = if let Some((name, rest)) = cmd.split_once('[') {
        (name.trim(), rest.trim_end_matches(']').trim())
    } else {
        (cmd, "")
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
        "getversion" => SstpResponse::ok(None).with_additional_data(ctx.version.clone()),
        "getshortversion" => SstpResponse::ok(None).with_additional_data(ctx.short_version.clone()),
        "getstatus" => {
            if ctx.status.is_empty() {
                SstpResponse::ok(None)
            } else {
                SstpResponse::ok(None).with_additional_data(ctx.status.clone())
            }
        }
        "getfmo" => SstpResponse::ok(None).with_additional_data(ctx.fmo_text.clone()),
        "quiet" | "restore" => SstpResponse::ok(None),
        _ => SstpResponse::bad_request().with_error_description("unknown command"),
    }
}
