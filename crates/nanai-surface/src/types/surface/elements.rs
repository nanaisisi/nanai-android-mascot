//! ElementDef, Points, BalloonOffset, SortKind データ構造および make_square_rect ヘルパーモジュール

use serde::{Deserialize, Serialize};

/// サーフィスレイヤー（ elementN ）定義
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct ElementDef {
    pub id: u32,
    pub method: crate::types::DrawMethod,
    pub file: String,
    pub x: i32,
    pub y: i32,
    pub options: Vec<String>,
}

/// 基準点（ centerx, centery, basepos, kinoko 等）定義
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct Points {
    pub center_x: Option<i32>,
    pub center_y: Option<i32>,
    pub basepos_x: Option<i32>,
    pub basepos_y: Option<i32>,
    pub kinoko_center_x: Option<i32>,
    pub kinoko_center_y: Option<i32>,
}

/// バルーンオフセット定義
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct BalloonOffset {
    pub x: Option<i32>,
    pub y: Option<i32>,
}

/// 当たり判定・アニメーションのソート順序
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum SortKind {
    None,
    Ascend,
    Descend,
    Id,
    UniqueJunk,
    UScoped,
    Custom(String),
}

impl Default for SortKind {
    fn default() -> Self {
        Self::Ascend
    }
}

impl SortKind {
    pub fn parse(s: &str) -> Self {
        match s.trim().to_lowercase().as_str() {
            "none" => Self::None,
            "ascend" => Self::Ascend,
            "descend" => Self::Descend,
            "id" => Self::Id,
            "unique-junk" => Self::UniqueJunk,
            "u-scoped" => Self::UScoped,
            other => Self::Custom(other.to_string()),
        }
    }
}

#[allow(non_camel_case_types)]
pub struct Make_square_rectParams {
    pub x1: i32,
    pub y1: i32,
    pub x2: i32,
    pub y2: i32,
}

/// 指定矩形を、中心を維持したまま長辺基準の正方形に整形する
pub fn make_square_rect(params: Make_square_rectParams) -> [i32; 4] {
    let x1 = params.x1;
    let y1 = params.y1;
    let x2 = params.x2;
    let y2 = params.y2;

    let min_x = x1.min(x2);
    let max_x = x1.max(x2);
    let min_y = y1.min(y2);
    let max_y = y1.max(y2);

    let w = max_x - min_x;
    let h = max_y - min_y;

    if w == h {
        return [min_x, min_y, max_x, max_y];
    }

    let side = w.max(h);
    let center_x = (min_x + max_x) / 2;
    let center_y = (min_y + max_y) / 2;

    let half = side / 2;
    let new_x1 = center_x - half;
    let new_y1 = center_y - half;
    let new_x2 = new_x1 + side;
    let new_y2 = new_y1 + side;

    [new_x1, new_y1, new_x2, new_y2]
}
