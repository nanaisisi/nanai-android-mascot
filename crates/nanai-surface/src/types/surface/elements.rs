//! ElementDef, Points, BalloonOffset, SortKind データ構造および make_square_rect ヘルパーモジュール

use crate::types::draw::DrawMethod;
use serde::{Deserialize, Serialize};

/// `element[N]` の1行分の定義
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ElementDef {
    pub id: u32,
    pub method: DrawMethod,
    /// 描画する画像ファイル（シェル相対パス）
    pub file: String,
    pub x: i32,
    pub y: i32,
    /// 追加オプション（トリミング等）
    pub options: Vec<String>,
}

/// サーフィスの基準点情報（`point.*`）
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct Points {
    pub center_x: Option<i32>,
    pub center_y: Option<i32>,
    pub basepos_x: Option<i32>,
    pub basepos_y: Option<i32>,
    pub kinoko_center_x: Option<i32>,
    pub kinoko_center_y: Option<i32>,
}

/// バルーン位置オフセット（`<char>.balloon.offsetx/y` / `balloon.offsetx/y`）
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct BalloonOffset {
    pub x: Option<i32>,
    pub y: Option<i32>,
}

/// `descript` ブロックの `animation.sort` / `collision.sort` 値
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum SortKind {
    /// `none`：記述順
    None,
    /// `ascend`：ID昇順 (1, 2, 3...)
    Ascend,
    /// `descend`：ID降順 (10, 9, 8...)
    Descend,
    /// `id`：アニメーションID順（ collision は当たり判定ID順）
    Id,
    /// `unique-junk`：ジャンクな重複を弾く
    UniqueJunk,
    /// `u-scoped`：U スコープ順
    UScoped,
    /// その他の拡張値
    Custom(String),
}

impl SortKind {
    pub fn parse(value: &str) -> Self {
        let v = value.trim().to_lowercase();
        match v.as_str() {
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

/// 指定矩形を、中心を維持したまま長辺基準の正方形に整形する
pub fn make_square_rect(x1: i32, y1: i32, x2: i32, y2: i32) -> [i32; 4] {
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
