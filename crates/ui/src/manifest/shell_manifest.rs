//! シェル全体のマニフェスト (`ShellManifest`) および `Shell::manifest` メソッド

use super::surface_manifest::SurfaceManifest;
use crate::descript::{BindGroup, Descript};
use crate::shell::Shell;
use crate::surfacetable::SurfaceTable;
use nanai_surface::{CursorDefinition, SortKind};
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

/// シェル全体のマニフェスト（`Shell::manifest()` の出力）
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct ShellManifest {
    /// シェル表示名（descript `name`、無ければディレクトリ名）
    pub(crate) name: String,
    /// シェル作者名（`craftmanw` / `craftman`）
    pub(crate) craftman: Option<String>,
    /// シェルディレクトリ（絶対パス）
    pub(crate) directory: String,
    /// `descript.txt` パース結果（全プロパティ）
    pub(crate) descript: Descript,
    /// サーフィス定義（番号昇順）
    pub(crate) surfaces: Vec<SurfaceManifest>,
    /// `surface.alias` / `sakura.surface.alias` ブロックの エイリアス名 → サーフィス番号列
    pub(crate) aliases: BTreeMap<String, Vec<u32>>,
    /// `kero.surface.alias` / `char1.surface.alias` ブロックの エイリアス名 → 番号列
    pub(crate) kero_aliases: BTreeMap<String, Vec<u32>>,
    /// `surfacetable.txt` パース結果（任意）
    pub(crate) surface_table: Option<SurfaceTable>,
    /// さくら（\0）の着せ替えパーツ定義
    pub(crate) sakura_bind_groups: Vec<BindGroup>,
    /// うにゅう（\1 / kero）の着せ替えパーツ定義
    pub(crate) kero_bind_groups: Vec<BindGroup>,
    /// `collision-sort` / `collision.sort` 設定（ascend, descend, id, none）
    #[serde(default)]
    pub(crate) collision_sort: Option<SortKind>,
    /// `animation-sort` / `animation.sort` 設定
    #[serde(default)]
    pub(crate) animation_sort: Option<SortKind>,
    /// `*.cursor` ブロック定義
    #[serde(default)]
    pub(crate) cursors: BTreeMap<String, Vec<CursorDefinition>>,
    /// `*.tooltips` ブロック定義
    #[serde(default)]
    pub(crate) tooltips: BTreeMap<String, BTreeMap<String, String>>,
}

#[allow(dead_code)]
impl ShellManifest {
    pub fn name(&self) -> &str {
        &self.name
    }
    pub fn craftman(&self) -> Option<&str> {
        self.craftman.as_deref()
    }
    pub fn directory(&self) -> &str {
        &self.directory
    }
    pub fn descript(&self) -> &Descript {
        &self.descript
    }
    pub fn surfaces(&self) -> &[SurfaceManifest] {
        &self.surfaces
    }
    pub fn aliases(&self) -> &BTreeMap<String, Vec<u32>> {
        &self.aliases
    }
    pub fn kero_aliases(&self) -> &BTreeMap<String, Vec<u32>> {
        &self.kero_aliases
    }
    pub fn surface_table(&self) -> Option<&SurfaceTable> {
        self.surface_table.as_ref()
    }
    pub fn sakura_bind_groups(&self) -> &[BindGroup] {
        &self.sakura_bind_groups
    }
    pub fn kero_bind_groups(&self) -> &[BindGroup] {
        &self.kero_bind_groups
    }
    pub fn collision_sort(&self) -> Option<&SortKind> {
        self.collision_sort.as_ref()
    }
    pub fn animation_sort(&self) -> Option<&SortKind> {
        self.animation_sort.as_ref()
    }
    pub fn cursors(&self) -> &BTreeMap<String, Vec<CursorDefinition>> {
        &self.cursors
    }
    pub fn tooltips(&self) -> &BTreeMap<String, BTreeMap<String, String>> {
        &self.tooltips
    }
}

impl Shell {
    /// パース済みシェルを JSON 連携用マニフェストへ変換する
    pub fn manifest(&self) -> ShellManifest {
        let mut surfaces: Vec<SurfaceManifest> = self
            .surfaces_txt
            .surfaces()
            .iter()
            .map(|(number, definition)| SurfaceManifest {
                number: *number,
                name: definition
                    .name()
                    .map(str::to_string)
                    .or_else(|| self.surface_display_name(*number).map(str::to_string)),
                definition: definition.clone(),
            })
            .collect();
        surfaces.sort_by_key(|s| s.number);

        ShellManifest {
            name: self.display_name(),
            craftman: self.craftman().cloned(),
            directory: self.directory.to_string_lossy().into_owned(),
            descript: self.descript.clone(),
            surfaces,
            aliases: self.surfaces_txt.aliases().clone(),
            kero_aliases: self.surfaces_txt.kero_aliases().clone(),
            surface_table: self.surface_table.clone(),
            sakura_bind_groups: self.sakura_bind_groups(),
            kero_bind_groups: self.kero_bind_groups(),
            collision_sort: self.surfaces_txt.collision_sort().cloned(),
            animation_sort: self.surfaces_txt.animation_sort().cloned(),
            cursors: self.surfaces_txt.cursors().clone(),
            tooltips: self.surfaces_txt.tooltips().clone(),
        }
    }
}
