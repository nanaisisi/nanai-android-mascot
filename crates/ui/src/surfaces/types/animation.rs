//! SERIKO アニメーション定義の型

use serde::{Deserialize, Serialize};

use super::collision::CollisionArea;
use super::draw::{DrawMethod, Interval};

/// `animation[N].pattern[K]` の1コマ分の定義
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AnimationPattern {
    pub index: u32,
    pub method: DrawMethod,
    /// 表示するサーフィス番号（-1 はここまでのアニメ結果のクリア）
    pub surface: i32,
    /// このフレームの待ち時間（ミリ秒）の下限
    pub wait: u32,
    /// 待ち時間の上限（SSP の `min-max` 範囲指定。単一値の場合は None）
    #[serde(default)]
    pub wait_max: Option<u32>,
    pub x: i32,
    pub y: i32,
    /// 追加オプション
    pub options: Vec<String>,
}

/// 一つの SERIKO アニメーション定義
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct SerikoAnimation {
    pub id: u32,
    pub interval: Option<Interval>,
    /// メニュー等で表示される アニメーション名（`animation[N].name`）
    pub name: Option<String>,
    pub patterns: Vec<AnimationPattern>,
    /// アニメーション動作中有効な当たり判定（`animation[N].collision` / `collisionex`）
    #[serde(default)]
    pub collisions: Vec<CollisionArea>,
    /// `animation[N].option` 系に指定された内容（元のトークン列）
    pub options: Vec<Vec<String>>,
}
