//! SERIKO アニメーション定義の型

use serde::{Deserialize, Serialize};

use super::collision::CollisionArea;
use super::draw::{DrawMethod, Interval};

/// `animation[N].pattern[K]` の1コマ分の定義
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AnimationPattern {
    pub(crate) index: u32,
    pub(crate) method: DrawMethod,
    /// 表示するサーフィス番号（-1 はここまでのアニメ結果のクリア）
    pub(crate) surface: i32,
    /// このフレームの待ち時間（ミリ秒）の下限
    pub(crate) wait: u32,
    /// 待ち時間の上限（SSP の `min-max` 範囲指定。単一値の場合は None）
    #[serde(default)]
    pub(crate) wait_max: Option<u32>,
    pub(crate) x: i32,
    pub(crate) y: i32,
    /// 追加オプション
    pub(crate) options: Vec<String>,
}

#[allow(dead_code)]
impl AnimationPattern {
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        index: u32,
        method: DrawMethod,
        surface: i32,
        wait: u32,
        wait_max: Option<u32>,
        x: i32,
        y: i32,
        options: Vec<String>,
    ) -> Self {
        Self {
            index,
            method,
            surface,
            wait,
            wait_max,
            x,
            y,
            options,
        }
    }

    // Add getter methods
    pub fn index(&self) -> u32 {
        self.index
    }
    pub fn method(&self) -> &DrawMethod {
        &self.method
    }
    pub fn surface(&self) -> i32 {
        self.surface
    }
    pub fn wait(&self) -> u32 {
        self.wait
    }
    pub fn wait_max(&self) -> Option<u32> {
        self.wait_max
    }
    pub fn x(&self) -> i32 {
        self.x
    }
    pub fn y(&self) -> i32 {
        self.y
    }
    pub fn options(&self) -> &[String] {
        &self.options
    }
}

/// 一つの SERIKO アニメーション定義
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct SerikoAnimation {
    pub(crate) id: u32,
    pub(crate) interval: Option<Interval>,
    /// メニュー等で表示される アニメーション名（`animation[N].name`）
    pub(crate) name: Option<String>,
    pub(crate) patterns: Vec<AnimationPattern>,
    /// アニメーション動作中有効な当たり判定（`animation[N].collision` / `collisionex`）
    #[serde(default)]
    pub(crate) collisions: Vec<CollisionArea>,
    /// `animation[N].option` 系に指定された内容（元のトークン列）
    pub(crate) options: Vec<Vec<String>>,
}

#[allow(dead_code)]
impl SerikoAnimation {
    pub fn new(
        id: u32,
        interval: Option<Interval>,
        name: Option<String>,
        patterns: Vec<AnimationPattern>,
        collisions: Vec<CollisionArea>,
        options: Vec<Vec<String>>,
    ) -> Self {
        Self {
            id,
            interval,
            name,
            patterns,
            collisions,
            options,
        }
    }

    // Add getter methods
    pub fn id(&self) -> u32 {
        self.id
    }
    pub fn interval(&self) -> Option<&Interval> {
        self.interval.as_ref()
    }
    pub fn name(&self) -> Option<&str> {
        self.name.as_deref()
    }
    pub fn patterns(&self) -> &[AnimationPattern] {
        &self.patterns
    }
    pub fn collisions(&self) -> &[CollisionArea] {
        &self.collisions
    }
    pub fn options(&self) -> &[Vec<String>] {
        &self.options
    }
}
