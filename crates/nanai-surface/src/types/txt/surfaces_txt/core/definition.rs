//! `surfaces.txt` 全体構造体定義および ID 列挙クエリデータ構造モジュール

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

use crate::types::CursorDefinition;
use crate::types::surface::{SortKind, SurfaceDefinition};

/// `surfaces.txt` のパース結果
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct SurfacesTxt {
    /// `charset,` 指定（例: Shift_JIS）
    pub charset: Option<String>,
    /// `descript` ブロック内の `version,` 指定（0: 旧形式 / 1: 新形式・推奨）
    pub version: u32,
    /// `descript` ブロック内の `maxwidth,`
    pub maxwidth: Option<i32>,
    pub animation_sort: Option<SortKind>,
    pub collision_sort: Option<SortKind>,
    /// サーフィス番号 → 定義
    pub surfaces: BTreeMap<u32, SurfaceDefinition>,
    /// `surface.alias` ブロックの エイリアス名 → サーフィス番号列
    pub aliases: BTreeMap<String, Vec<u32>>,
    /// `kero.surface.alias` / `char1.surface.alias` ブロックのエイリアス名 → 番号列
    #[serde(default)]
    pub kero_aliases: BTreeMap<String, Vec<u32>>,
    /// `char<N>.surface.alias` ブロック定義（キャラクタID -> (エイリアス名 -> 番号列)）
    #[serde(default)]
    pub char_aliases: BTreeMap<u32, BTreeMap<String, Vec<u32>>>,
    /// `*.cursor` ブロック定義（スコープ名 -> カーソル定義列）
    #[serde(default)]
    pub cursors: BTreeMap<String, Vec<CursorDefinition>>,
    /// `*.tooltips` ブロック定義（スコープ名 -> (当たり判定名 -> ツールチップ本文)）
    #[serde(default)]
    pub tooltips: BTreeMap<String, BTreeMap<String, String>>,
    /// ルート（ブロック外）の未分類キー・バリュー
    pub properties: BTreeMap<String, String>,
}

impl SurfacesTxt {
    /// テキスト内容から `surfaces.txt` をパースする
    pub fn parse(text: &str) -> Self {
        crate::parser::parse_surfaces_txt(text)
    }

    /// サーフィス番号に対応する定義を取得
    pub fn surface(&self, number: u32) -> Option<&SurfaceDefinition> {
        self.surfaces.get(&number)
    }

    /// 定義済みの全サーフィスID（昇順）を取得する (`currentghost.seriko.surfacelist.defined`)
    pub fn defined_surface_ids(&self) -> Vec<u32> {
        self.surfaces.keys().copied().collect()
    }

    /// 定義済みおよびエイリアスを含むすべての利用可能サーフィスID（昇順・重複なし）を取得する (`currentghost.seriko.surfacelist.all`)
    pub fn all_surface_ids(&self) -> Vec<u32> {
        let mut set = std::collections::BTreeSet::new();
        set.extend(self.surfaces.keys().copied());
        for list in self.aliases.values() {
            set.extend(list.iter().copied());
        }
        for list in self.kero_aliases.values() {
            set.extend(list.iter().copied());
        }
        for map in self.char_aliases.values() {
            for list in map.values() {
                set.extend(list.iter().copied());
            }
        }
        set.into_iter().collect()
    }
}
