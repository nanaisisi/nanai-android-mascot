use crate::sstp::message::{SstpRequest, SstpResponse};
use crate::sstp::types::SstpMethod;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// ゴースト側 descript.txt 由来の SSTP 制御設定 (UKADOC descript.txt 規格準拠)
/// [sstp.allowcommunicate], [sstp.allowunspecifiedsend], [sstp.alwaystranslate]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SstpGhostConfig {
    /// sstp.allowcommunicate: 0 で COMMUNICATE を受けない。デフォルトは 1
    #[serde(default = "default_allow_communicate")]
    pub allow_communicate: bool,
    /// sstp.allowunspecifiedsend: 0 でゴーストを指名しない SSTP を受けない。デフォルトは 1
    #[serde(default = "default_allow_unspecified_send")]
    pub allow_unspecified_send: bool,
    /// sstp.alwaystranslate: 1 で SSTP オプションにかかわらず常時 OnTranslate を実行。デフォルトは 0
    #[serde(default = "default_always_translate")]
    pub always_translate: bool,
}

fn default_allow_communicate() -> bool {
    true
}

fn default_allow_unspecified_send() -> bool {
    true
}

fn default_always_translate() -> bool {
    false
}

impl Default for SstpGhostConfig {
    fn default() -> Self {
        Self {
            allow_communicate: default_allow_communicate(),
            allow_unspecified_send: default_allow_unspecified_send(),
            always_translate: default_always_translate(),
        }
    }
}

impl SstpGhostConfig {
    /// descript.txt のキーマップから SSTP 設定をパース
    pub fn from_descript_map(map: &HashMap<String, String>) -> Self {
        let allow_communicate = map
            .get("sstp.allowcommunicate")
            .map(|v| v.trim() != "0")
            .unwrap_or(true);

        let allow_unspecified_send = map
            .get("sstp.allowunspecifiedsend")
            .map(|v| v.trim() != "0")
            .unwrap_or(true);

        let always_translate = map
            .get("sstp.alwaystranslate")
            .map(|v| v.trim() == "1")
            .unwrap_or(false);

        Self {
            allow_communicate,
            allow_unspecified_send,
            always_translate,
        }
    }

    /// リクエストの受入判定（拒否理由があれば Refuse / BadRequest 等の SstpResponse を返す）
    pub fn validate_request(&self, req: &SstpRequest) -> Result<(), SstpResponse> {
        // [sstp.allowcommunicate]: COMMUNICATE メソッドの拒否判定
        if req.method == SstpMethod::Communicate && !self.allow_communicate {
            return Err(
                SstpResponse::refuse().with_error_description("COMMUNICATE disabled by ghost")
            );
        }

        // [sstp.allowunspecifiedsend]: ゴーストを指名しない SEND メソッドの拒否判定
        if req.method == SstpMethod::Send && !self.allow_unspecified_send {
            let is_specified = req.receiver_ghost_name.is_some()
                || req.receiver_ghost_hwnd.is_some()
                || !req.if_ghosts.is_empty();
            if !is_specified {
                return Err(SstpResponse::refuse()
                    .with_error_description("Unspecified SEND disabled by ghost"));
            }
        }

        Ok(())
    }

    /// [sstp.alwaystranslate]: notranslate オプション指定を上書きして翻訳を強制するか判定
    pub fn should_translate(&self, req: &SstpRequest) -> bool {
        if self.always_translate {
            true
        } else {
            !req.is_notranslate()
        }
    }
}

/// SSTP EXECUTE コマンドのディスパッチ処理ヘルパー
#[derive(Debug, Clone, Default)]
pub struct SstpGhostContext {
    pub name: String,
    pub sakura_name: String,
    pub kero_name: String,
    pub shell_name: String,
    pub balloon_name: String,
    pub version: String,
    pub short_version: String,
    pub status: String,
    pub fmo_text: String,
    pub installed_ghosts: Vec<String>,
    pub sstp_config: SstpGhostConfig,
}
