use super::types::IfGhostEntry;
use crate::sstp::types::SstpMethod;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// SSTP リクエスト構造体
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SstpRequest {
    pub(crate) method: SstpMethod,
    pub(crate) version: String,
    pub(crate) charset: Option<String>,
    pub(crate) sender: String,
    pub(crate) script: Option<String>,
    pub(crate) event: Option<String>,
    pub(crate) sentence: Option<String>,
    pub(crate) command: Option<String>,
    pub(crate) hwnd: Option<u64>,
    pub(crate) receiver_ghost_hwnd: Option<u64>,
    pub(crate) receiver_ghost_name: Option<String>,
    pub(crate) security_level: Option<String>,
    pub(crate) security_origin: Option<String>,
    pub(crate) id: Option<String>,
    pub(crate) options: Vec<String>,
    pub(crate) entry: Option<String>,
    pub(crate) if_ghosts: Vec<IfGhostEntry>,
    pub(crate) references: HashMap<String, String>,
    pub(crate) pass_thru: HashMap<String, String>,
    pub(crate) keep_alive: bool,
    /// HTTP 互換 Connection ヘッダ ("keep-alive" / "close")
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(crate) connection: Option<String>,
    /// COMMUNICATE / GIVE 拡張ヘッダ: 送信元サーフィス番号 (例: "0,10")
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(crate) surface: Option<String>,
    /// GIVE/旧仕様 拡張ヘッダ: 文書
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(crate) document: Option<String>,
    /// GIVE/旧仕様 拡張ヘッダ: 楽曲名
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(crate) song: Option<String>,
    /// 対象ゴースト名 (descript.txt の name)
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(crate) ghost: Option<String>,
    /// SAORI over DirectSSTP: Module ヘッダ
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(crate) module: Option<String>,
    /// DirectSSTP フラグ
    #[serde(default)]
    pub(crate) is_direct: bool,
    /// HTTP トンネリング / 互換ヘッダ: Content-Type (例: "text/plain", "application/x-sstp")
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(crate) content_type: Option<String>,
    /// HTTP トンネリング / 互換ヘッダ: User-Agent
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(crate) user_agent: Option<String>,
    /// HTTP トンネリング / 互換ヘッダ: Host (例: "127.0.0.1:9801")
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(crate) host: Option<String>,
}

#[allow(dead_code)]
impl SstpRequest {
    // Add getter methods
    pub fn method(&self) -> SstpMethod { self.method }
    pub fn version(&self) -> &str { &self.version }
    pub fn charset(&self) -> Option<&str> { self.charset.as_deref() }
    pub fn sender(&self) -> &str { &self.sender }
    pub fn script(&self) -> Option<&str> { self.script.as_deref() }
    pub fn event(&self) -> Option<&str> { self.event.as_deref() }
    pub fn sentence(&self) -> Option<&str> { self.sentence.as_deref() }
    pub fn command(&self) -> Option<&str> { self.command.as_deref() }
    pub fn hwnd(&self) -> Option<u64> { self.hwnd }
    pub fn receiver_ghost_hwnd(&self) -> Option<u64> { self.receiver_ghost_hwnd }
    pub fn receiver_ghost_name(&self) -> Option<&str> { self.receiver_ghost_name.as_deref() }
    pub fn security_level(&self) -> Option<&str> { self.security_level.as_deref() }
    pub fn security_origin(&self) -> Option<&str> { self.security_origin.as_deref() }
    pub fn id(&self) -> Option<&str> { self.id.as_deref() }
    pub fn options(&self) -> &[String] { &self.options }
    pub fn entry(&self) -> Option<&str> { self.entry.as_deref() }
    pub fn if_ghosts(&self) -> &[IfGhostEntry] { &self.if_ghosts }
    pub fn references(&self) -> &HashMap<String, String> { &self.references }
    pub fn pass_thru(&self) -> &HashMap<String, String> { &self.pass_thru }
    pub fn keep_alive(&self) -> bool { self.keep_alive }
    pub fn connection(&self) -> Option<&str> { self.connection.as_deref() }
    pub fn surface(&self) -> Option<&str> { self.surface.as_deref() }
    pub fn document(&self) -> Option<&str> { self.document.as_deref() }
    pub fn song(&self) -> Option<&str> { self.song.as_deref() }
    pub fn ghost(&self) -> Option<&str> { self.ghost.as_deref() }
    pub fn module(&self) -> Option<&str> { self.module.as_deref() }
    pub fn is_direct(&self) -> bool { self.is_direct }
    pub fn content_type(&self) -> Option<&str> { self.content_type.as_deref() }
    pub fn user_agent(&self) -> Option<&str> { self.user_agent.as_deref() }
    pub fn host(&self) -> Option<&str> { self.host.as_deref() }
}

impl SstpRequest {
    /// 対象のゴースト名（sakura名, kero名）に応じたスクリプトを解決する
    pub fn resolve_script(&self, sakura_name: &str, kero_name: &str) -> Option<&str> {
        for entry in &self.if_ghosts {
            if let Some((target_sakura, target_kero)) = entry.target().split_once(',') {
                if target_sakura.trim().eq_ignore_ascii_case(sakura_name)
                    && target_kero.trim().eq_ignore_ascii_case(kero_name)
                {
                    return Some(entry.script());
                }
            } else if entry.target().trim().eq_ignore_ascii_case(sakura_name) {
                return Some(entry.script());
            }
        }
        self.script.as_deref()
    }

    /// 指定されたオプションが含まれるか判定
    pub fn has_option(&self, opt: &str) -> bool {
        self.options.iter().any(|o| o.eq_ignore_ascii_case(opt))
    }

    /// nobreak オプション指定（実行中スクリプト終了待ち）
    pub fn is_nobreak(&self) -> bool {
        self.has_option("nobreak")
    }

    /// notranslate オプション指定（OnTranslate等の変換スキップ）
    pub fn is_notranslate(&self) -> bool {
        self.has_option("notranslate")
    }

    /// nodescript オプション指定（バルーンのSSTP表示無効化）
    pub fn is_nodescript(&self) -> bool {
        self.has_option("nodescript")
    }

    /// strict オプション指定（SakuraScript解釈失敗をログ記録）
    pub fn is_strict(&self) -> bool {
        self.has_option("strict")
    }

    /// notify オプション指定
    pub fn is_notify(&self) -> bool {
        self.has_option("notify")
    }

    /// SAORI over DirectSSTP のリクエストであるか判定
    pub fn is_saori_request(&self) -> bool {
        self.module.is_some() || self.version.to_uppercase().contains("SAORI")
    }
}
