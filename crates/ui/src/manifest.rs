//! シェルマニフェスト（Rust パース結果を JSON 化して JS / Canvas 側へ共有する層）
//!
//! `Shell::manifest()` が `ShellManifest` を生成し、Tauri コマンド経由で
//! フロントエンドへ渡す。JS 側は JSON をそのまま消費して
//! element 合成・SERIKO 再生・当たり判定・着せ替え描画を行う。

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

use crate::descript::{BindGroup, Descript};
use crate::shell::Shell;
use crate::surfaces_core_core::SortKind;
use crate::surfaces_core_integration::{CursorDefinition, SurfaceDefinition};
use crate::surfacetable::SurfaceTable;

/// 1サーフィス分のマニフェスト（番号 + 定義 + 表示名）
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct SurfaceManifest {
    /// サーフィス番号
    pub(crate) number: u32,
    /// `surfaces.txt` の `name,` / surfacetable の表示名（無ければ None）
    pub(crate) name: Option<String>,
    /// element / animation / collision / point 定義
    pub(crate) definition: SurfaceDefinition,
}

impl SurfaceManifest {
    // Add getter methods
    pub fn number(&self) -> u32 {
        self.number
    }
    pub fn name(&self) -> Option<&str> {
        self.name.as_deref()
    }
    pub fn definition(&self) -> &SurfaceDefinition {
        &self.definition
    }

    pub fn new(number: u32, name: Option<String>, definition: SurfaceDefinition) -> Self {
        Self {
            number,
            name,
            definition,
        }
    }
}

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
    // Add getter methods
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
            .surfaces
            .iter()
            .map(|(number, definition)| SurfaceManifest {
                number: *number,
                name: definition
                    .name
                    .clone()
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
            aliases: self.surfaces_txt.aliases.clone(),
            kero_aliases: self.surfaces_txt.kero_aliases.clone(),
            surface_table: self.surface_table.clone(),
            sakura_bind_groups: self.sakura_bind_groups(),
            kero_bind_groups: self.kero_bind_groups(),
            collision_sort: self.surfaces_txt.collision_sort.clone(),
            animation_sort: self.surfaces_txt.animation_sort.clone(),
            cursors: self.surfaces_txt.cursors.clone(),
            tooltips: self.surfaces_txt.tooltips.clone(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// 実プロジェクトのサンプルシェル
    fn mock_shell_dir() -> std::path::PathBuf {
        std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../../assets/ghost/mock_nanai/shell/master")
    }

    #[test]
    fn test_manifest_from_synthetic() {
        // 最小シェルからのマニフェスト生成
        let dir = std::env::temp_dir().join("nanai_manifest_test_shell");
        let _ = std::fs::remove_dir_all(&dir);
        std::fs::create_dir_all(&dir).unwrap();
        std::fs::write(
            dir.join("surfaces.txt"),
            "charset,Shift_JIS\nsurface0\n{\nelement0,base,surface0.png,0,0\ncollisionex0,head,rect,0,0,10,10\nanimation100.interval,bind\nanimation100.pattern0,add,100,0,0,0\n}\n",
        )
        .unwrap();
        std::fs::write(
            dir.join("descript.txt"),
            "type,shell\nname,manifest_test\ncraftmanw,Tester\n",
        )
        .unwrap();

        let shell = Shell::load(&dir).unwrap();
        let manifest = shell.manifest();

        assert_eq!(manifest.name(), "manifest_test");
        assert_eq!(manifest.craftman(), Some("Tester"));
        assert_eq!(
            manifest.descript().type_().map(|s| s.as_str()),
            Some("shell")
        );
        assert_eq!(manifest.surfaces().len(), 1);
        assert_eq!(manifest.surfaces()[0].number(), 0);
        assert_eq!(
            manifest.surfaces()[0].definition().element(0).unwrap().file,
            "surface0.png"
        );
        assert_eq!(manifest.sakura_bind_groups().len(), 0);

        // JSON 化できる
        let json = serde_json::to_string(&manifest).unwrap();
        assert!(json.contains("\"surfaces\""));
        assert!(json.contains("surface0.png"));
        std::fs::remove_dir_all(&dir).ok();
    }

    #[test]
    fn test_manifest_json_roundtrip_mock_nanai() {
        let dir = mock_shell_dir();
        let shell = Shell::load(&dir).unwrap();
        let manifest = shell.manifest();

        // 構造確認
        assert_eq!(manifest.name(), "master");
        let s0 = manifest
            .surfaces()
            .iter()
            .find(|s| s.number() == 0)
            .unwrap();
        assert!(
            s0.definition()
                .collisions
                .iter()
                .any(|c| c.name() == "head")
        );
        assert!(s0.definition().animations.contains_key(&0));
        assert!(!manifest.sakura_bind_groups().is_empty());
        assert!(!manifest.kero_bind_groups().is_empty());
        assert!(manifest.surface_table().is_some());

        // JSON → 構造体 ラウンドトリップ
        let json = serde_json::to_string(&manifest).unwrap();
        let back: ShellManifest = serde_json::from_str(&json).unwrap();
        assert_eq!(back, manifest);

        // 画像ファイル参照が残っている
        assert!(json.contains("surface0.png"));
    }
}
