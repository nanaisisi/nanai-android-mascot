use serde::{Deserialize, Serialize};

/// シェル descript の `[target].defaultx/y/left/top`（基準位置）
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct CharDefaults {
    pub(crate) x: Option<i32>,
    pub(crate) y: Option<i32>,
    pub(crate) left: Option<i32>,
    pub(crate) top: Option<i32>,
}

#[allow(dead_code)]
impl CharDefaults {
    // Add getter methods
    pub fn x(&self) -> Option<i32> {
        self.x
    }
    pub fn y(&self) -> Option<i32> {
        self.y
    }
    pub fn left(&self) -> Option<i32> {
        self.left
    }
    pub fn top(&self) -> Option<i32> {
        self.top
    }
}

/// `[target].bindoption.group`（着せ替え選択の挙動設定）
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct BindOptionGroup {
    /// メニューに表示するカテゴリ名
    pub(crate) category: String,
    /// `mustselect` / `multiple` 等
    pub(crate) options: Vec<String>,
}

#[allow(dead_code)]
impl BindOptionGroup {
    // Add getter methods
    pub fn category(&self) -> &str {
        &self.category
    }
    pub fn options(&self) -> &[String] {
        &self.options
    }
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
/// `[target].bindgroup[N]` の着せ替えパーツ定義
pub struct BindGroup {
    /// 対応する SHEIKO アニメーションID（着せ替え番号）
    pub(crate) number: u32,
    /// メニューに表示するカテゴリ名（`bindgroup[N].name` 第1パラメータ）
    pub(crate) category: String,
    /// パーツ名（`bindgroup[N].name` 第2パラメータ）
    pub(crate) part: String,
    /// サムネイル画像ファイル名（省略可）
    pub(crate) thumbnail: Option<String>,
    /// `bindgroup[N].default,1` 設定（初期装着）
    pub(crate) default: bool,
    /// `bindgroup[N].addid` 追加装着アニメーションID列
    pub(crate) add_ids: Vec<u32>,
}

#[allow(dead_code)]
impl BindGroup {
    // Add getter methods
    pub fn number(&self) -> u32 {
        self.number
    }
    pub fn category(&self) -> &str {
        &self.category
    }
    pub fn part(&self) -> &str {
        &self.part
    }
    pub fn thumbnail(&self) -> Option<&str> {
        self.thumbnail.as_deref()
    }
    pub fn is_default(&self) -> bool {
        self.default
    }
    pub fn add_ids(&self) -> &[u32] {
        &self.add_ids
    }
}
