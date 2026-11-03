use super::types::IfGhostEntry;
use crate::sstp::types::SstpMethod;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// SSTP リクエスト構造体
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SstpRequest {
    pub method: SstpMethod,
    pub version: String,
    pub charset: Option<String>,
    pub sender: String,
    pub script: Option<String>,
    pub event: Option<String>,
    pub sentence: Option<String>,
    pub command: Option<String>,
    pub hwnd: Option<u64>,
    pub receiver_ghost_hwnd: Option<u64>,
    pub receiver_ghost_name: Option<String>,
    pub security_level: Option<String>,
    pub security_origin: Option<String>,
    pub id: Option<String>,
    pub options: Vec<String>,
    pub entry: Option<String>,
    pub if_ghosts: Vec<IfGhostEntry>,
    pub references: HashMap<String, String>,
    pub pass_thru: HashMap<String, String>,
    pub keep_alive: bool,
    /// HTTP 互換 Connection ヘッダ ("keep-alive" / "close")
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub connection: Option<String>,
    /// COMMUNICATE / GIVE 拡張ヘッダ: 送信元サーフィス番号 (例: "0,10")
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub surface: Option<String>,
    /// GIVE/旧仕様 拡張ヘッダ: 文書
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub document: Option<String>,
    /// GIVE/旧仕様 拡張ヘッダ: 楽曲名
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub song: Option<String>,
    /// 対象ゴースト名 (descript.txt の name)
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub ghost: Option<String>,
    /// SAORI over DirectSSTP: Module ヘッダ
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub module: Option<String>,
    /// DirectSSTP フラグ
    #[serde(default)]
    pub is_direct: bool,
}

impl SstpRequest {
    /// 対象のゴースト名（sakura名, kero名）に応じたスクリプトを解決する
    pub fn resolve_script(&self, sakura_name: &str, kero_name: &str) -> Option<&str> {
        for entry in &self.if_ghosts {
            if let Some((target_sakura, target_kero)) = entry.target.split_once(',') {
                if target_sakura.trim().eq_ignore_ascii_case(sakura_name)
                    && target_kero.trim().eq_ignore_ascii_case(kero_name)
                {
                    return Some(&entry.script);
                }
            } else if entry.target.trim().eq_ignore_ascii_case(sakura_name) {
                return Some(&entry.script);
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
