use serde::{Deserialize, Serialize};

/// シェル descript の `[target].defaultx/y/left/top`（基準位置）
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct CharDefaults {
    pub x: Option<i32>,
    pub y: Option<i32>,
    pub left: Option<i32>,
    pub top: Option<i32>,
}

/// `[target].bindoption.group`（着せ替え選択の挙動設定）
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct BindOptionGroup {
    /// メニューに表示するカテゴリ名
    pub category: String,
    /// `mustselect` / `multiple` 等
    pub options: Vec<String>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
/// `[target].bindgroup[N]` の着せ替えパーツ定義
pub struct BindGroup {
    /// 対応する SHEIKO アニメーションID（着せ替え番号）
    pub number: u32,
    /// メニューに表示するカテゴリ名（`bindgroup[N].name` 第1パラメータ）
    pub category: String,
    /// パーツ名（`bindgroup[N].name` 第2パラメータ）
    pub part: String,
    /// サムネイル画像ファイル名（省略可）
    pub thumbnail: Option<String>,
    /// `bindgroup[N].default,1` 設定（初期装着）
    pub default: bool,
    /// `bindgroup[N].addid` 追加装着アニメーションID列
    pub add_ids: Vec<u32>,
}
