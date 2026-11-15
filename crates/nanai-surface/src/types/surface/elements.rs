//! ElementDef, Points, BalloonOffset, SortKind データ構造および make_square_rect ヘルパーモジュール

use serde::{Deserialize, Serialize};

/// サーフィスレイヤー（ elementN ）定義
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct ElementDef {
    pub(crate) id: u32,
    pub(crate) method: crate::types::DrawMethod,
    pub(crate) file: String,
    pub(crate) x: i32,
    pub(crate) y: i32,
    pub(crate) options: Vec<String>,
}

#[allow(dead_code)]
impl ElementDef {
    // Add getter methods
    pub fn id(&self) -> u32 {
        self.id
    }
    pub fn method(&self) -> &crate::types::DrawMethod {
        &self.method
    }
    pub fn file(&self) -> &str {
        &self.file
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

    pub fn new(
        id: u32,
        method: crate::types::DrawMethod,
        file: impl Into<String>,
        x: i32,
        y: i32,
        options: Vec<String>,
    ) -> Self {
        Self {
            id,
            method,
            file: file.into(),
            x,
            y,
            options,
        }
    }
}

/// 基準点（ centerx, centery, basepos, kinoko 等）定義
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct Points {
    pub(crate) center_x: Option<i32>,
    pub(crate) center_y: Option<i32>,
    pub(crate) basepos_x: Option<i32>,
    pub(crate) basepos_y: Option<i32>,
    pub(crate) kinoko_center_x: Option<i32>,
    pub(crate) kinoko_center_y: Option<i32>,
}

#[allow(dead_code)]
impl Points {
    // Add getter methods
    pub fn center_x(&self) -> Option<i32> {
        self.center_x
    }
    pub fn center_y(&self) -> Option<i32> {
        self.center_y
    }
    pub fn basepos_x(&self) -> Option<i32> {
        self.basepos_x
    }
    pub fn basepos_y(&self) -> Option<i32> {
        self.basepos_y
    }
    pub fn kinoko_center_x(&self) -> Option<i32> {
        self.kinoko_center_x
    }
    pub fn kinoko_center_y(&self) -> Option<i32> {
        self.kinoko_center_y
    }
}

/// バルーンオフセット定義
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct BalloonOffset {
    pub(crate) x: Option<i32>,
    pub(crate) y: Option<i32>,
}

#[allow(dead_code)]
impl BalloonOffset {
    // Add getter methods
    pub fn x(&self) -> Option<i32> {
        self.x
    }
    pub fn y(&self) -> Option<i32> {
        self.y
    }
}

/// 当たり判定・アニメーションのソート順序
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Default)]
pub enum SortKind {
    None,
    #[default]
    Ascend,
    Descend,
    Id,
    UniqueJunk,
    UScoped,
    Custom(String),
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
    pub(crate) x1: i32,
    pub(crate) y1: i32,
    pub(crate) x2: i32,
    pub(crate) y2: i32,
}

#[allow(dead_code)]
impl Make_square_rectParams {
    // Add getter methods
    pub fn x1(&self) -> i32 {
        self.x1
    }
    pub fn y1(&self) -> i32 {
        self.y1
    }
    pub fn x2(&self) -> i32 {
        self.x2
    }
    pub fn y2(&self) -> i32 {
        self.y2
    }
}

/// 指定矩形を、中心を維持したまま長辺基準の正方形に整形する
pub fn make_square_rect(params: Make_square_rectParams) -> [i32; 4] {
    let x1 = params.x1();
    let y1 = params.y1();
    let x2 = params.x2();
    let y2 = params.y2();

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
