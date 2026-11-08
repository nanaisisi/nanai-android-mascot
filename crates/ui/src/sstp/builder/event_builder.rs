//! SSTP イベント（SHIORI イベント OnSSTPBreak, OnSSTPBlacklisting 等）パラメータ生成ビルダー

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
