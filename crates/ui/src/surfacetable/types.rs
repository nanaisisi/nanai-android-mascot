use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use super::parser::parse_surface_table;

/// グループ内の1登録（`[サーフィス番号],[名前]`）
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct SurfTableEntry {
    pub surface_id: u32,
    pub name: String,
}

/// `group,[グループ名] {}` の定義
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct SurfTableGroup {
    /// グループ名（`__disabled` は非表示グループ）
    pub name: String,
    pub entries: Vec<SurfTableEntry>,
}

impl SurfTableGroup {
    /// 非表示グループ（`__disabled`）か
    pub fn is_disabled(&self) -> bool {
        self.name == "__disabled"
    }
}

/// `surfacetable.txt` のパース結果
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct SurfaceTable {
    /// 1行目に記述が必須の `charset,` 指定
    pub charset: Option<String>,
    /// `version,` 指定（2014年規格では 1 のみ）
    pub version: u32,
    /// `scope,` 指定（サーフィスの登録スコープ）
    pub scope: Option<u32>,
    /// `option,` の内容（任意個）
    pub options: Vec<Vec<String>>,
    /// グループ定義（記述順）
    pub groups: Vec<SurfTableGroup>,
    /// 未分類のキー・バリュー
    pub properties: BTreeMap<String, String>,
}

impl SurfaceTable {
    /// テキスト内容から `surfacetable.txt` をパースする
    pub fn parse(text: &str) -> Self {
        parse_surface_table(text)
    }

    /// グループ名で検索（大文字小文字・前後の空白は無視）
    pub fn group(&self, name: &str) -> Option<&SurfTableGroup> {
        self.groups
            .iter()
            .find(|g| g.name.eq_ignore_ascii_case(name))
    }

    /// サーフィステストに表示すべき登録（`__disabled` グループを除外）
    pub fn visible_entries(&self) -> Vec<&SurfTableEntry> {
        self.groups
            .iter()
            .filter(|g| !g.is_disabled())
            .flat_map(|g| g.entries.iter())
            .collect()
    }

    /// サーフィスIDから名前を検索（可視グループのみ）
    pub fn name_of(&self, surface_id: u32) -> Option<&str> {
        self.visible_entries()
            .iter()
            .find(|e| e.surface_id == surface_id)
            .map(|e| e.name.as_str())
    }

    /// 指定されたオプションが含まれているか判定する（大文字小文字無視）
    pub fn has_option(&self, option_name: &str) -> bool {
        self.options
            .iter()
            .flatten()
            .any(|opt| opt.eq_ignore_ascii_case(option_name))
    }

    /// `DisableNoDefineSurfaces` オプションが指定されているか
    pub fn disable_no_define_surfaces(&self) -> bool {
        self.has_option("DisableNoDefineSurfaces")
    }
}
