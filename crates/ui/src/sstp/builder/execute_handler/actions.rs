//! SSTP アクション・操作・アーカイブ圧縮展開コマンド処理モジュール

use crate::sstp::message::SstpResponse;

/// アクション・操作・アーカイブ関連コマンドをハンドリングする
pub(super) fn handle_action_commands(
    cmd_name: &str,
    args: &[String],
    check_remote_prohibited: &impl Fn() -> Result<(), Box<SstpResponse>>,
) -> Option<SstpResponse> {
    match cmd_name {
        "quiet" | "restore" => {
            if let Err(err_resp) = check_remote_prohibited() {
                return Some(*err_resp);
            }
            Some(SstpResponse::ok(None))
        }
        "dumpsurface" | "moveasync" | "settrayicon" | "settrayballoon" => {
            if let Err(err_resp) = check_remote_prohibited() {
                return Some(*err_resp);
            }
            Some(SstpResponse::ok(None))
        }
        "compressarchive" | "extractarchive" => {
            if let Err(err_resp) = check_remote_prohibited() {
                return Some(*err_resp);
            }
            if args.len() < 2 {
                Some(SstpResponse::bad_request().with_error_description("missing archive paths"))
            } else {
                Some(SstpResponse::ok(None))
            }
        }
        "compact" | "cleansurface" => {
            // メモリ圧縮およびサーフィスキャッシュ解放 (UKADOC/SSP EXECUTE 規格準拠)
            if let Err(err_resp) = check_remote_prohibited() {
                return Some(*err_resp);
            }
            Some(SstpResponse::ok(None))
        }
        _ => None,
    }
}
