//! フレーム更新イベントおよびアニメーションオプション解析

use crate::surfaces::AnimationPattern;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;

/// フレーム更新ステップイベント (Slot-08 外部インターフェース規約)
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct FrameStepEvent {
    /// キャラクターのスコープ (0=さくら, 1=うにゅ 等)
    pub scope_id: u32,
    /// ベースサーフィスID
    pub base_surface_id: i32,
    /// アニメーションID
    pub animation_id: u32,
    /// 適用するアニメーションパターン
    pub pattern: AnimationPattern,
    /// アニメーション開始からの累積経過時間（ミリ秒）
    pub elapsed_ms: u32,
    /// アニメーション全体の終了（-1 到達または最終パターン完了）
    pub is_finished: bool,
    /// 背面描画オプション（background）指定の有無
    pub is_background: bool,
    /// X方向動的オフセット (\![anim,offset,ID,x,y])
    #[serde(default)]
    pub offset_x: i32,
    /// Y方向動的オフセット (\![anim,offset,ID,x,y])
    #[serde(default)]
    pub offset_y: i32,
}

/// アニメーションオプション解析結果
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct ParsedAnimationOptions {
    /// exclusive オプション (排他実行)
    pub is_exclusive: bool,
    /// exclusive の限定対象ID群 (None の場合は全アニメーション対象)
    pub exclusive_targets: Option<HashSet<u32>>,
    /// background オプション (ベースサーフィスの奥側で実行)
    pub is_background: bool,
    /// shared-index オプション (\s 切り替えを跨いでパターン番号を継続)
    pub is_shared_index: bool,
}

impl ParsedAnimationOptions {
    pub fn from_raw_options(raw_options: &[Vec<String>]) -> Self {
        let mut parsed = Self::default();
        for group in raw_options {
            for raw_token in group {
                let token = raw_token.trim().to_lowercase();
                if token.is_empty() {
                    continue;
                }

                // exclusive+(1,2) 形式や + 区切りオプション
                for subpart in token.split('+') {
                    let sub = subpart.trim();
                    if sub.starts_with("exclusive") {
                        parsed.is_exclusive = true;
                        // exclusive,(1,3,5) のような限定対象の抽出
                        if let Some(paren_open) = sub.find('(')
                            && let Some(paren_close) = sub[paren_open..].find(')')
                        {
                            let inner = &sub[paren_open + 1..paren_open + paren_close];
                            let mut targets = HashSet::new();
                            for id_str in inner.split(',') {
                                if let Ok(id) = id_str.trim().parse::<u32>() {
                                    targets.insert(id);
                                }
                            }
                            if !targets.is_empty() {
                                parsed.exclusive_targets = Some(targets);
                            }
                        }
                    } else if sub.starts_with("background") {
                        parsed.is_background = true;
                    } else if sub.starts_with("shared-index") || sub.starts_with("shared_index") {
                        parsed.is_shared_index = true;
                    }
                }

                // 括弧指定が別トークンにある場合: "exclusive", "(1,2)"
                if raw_token.trim().starts_with('(') && raw_token.trim().ends_with(')') {
                    let inner = &raw_token.trim()[1..raw_token.trim().len() - 1];
                    let mut targets = HashSet::new();
                    for id_str in inner.split(',') {
                        if let Ok(id) = id_str.trim().parse::<u32>() {
                            targets.insert(id);
                        }
                    }
                    if !targets.is_empty() {
                        parsed.exclusive_targets = Some(targets);
                    }
                }
            }
        }
        parsed
    }
}
