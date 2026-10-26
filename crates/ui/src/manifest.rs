//! シェルマニフェスト（Rust パース結果を JSON 化して JS / Canvas 側へ共有する層）
//!
//! `Shell::manifest()` が `ShellManifest` を生成し、Tauri コマンド経由で
//! フロントエンドへ渡す。JS 側は JSON をそのまま消費して
//! element 合成・SERIKO 再生・当たり判定・着せ替え描画を行う。

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

use crate::descript::{BindGroup, Descript};
use crate::shell::Shell;
use crate::surfacetable::SurfaceTable;
use crate::surfaces::SurfaceDefinition;

/// 1サーフィス分のマニフェスト（番号 + 定義 + 表示名）
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct SurfaceManifest {
    /// サーフィス番号
    pub number: u32,
    /// `surfaces.txt` の `name,` / surfacetable の表示名（無ければ None）
    pub name: Option<String>,
    /// element / animation / collision / point 定義
    pub definition: SurfaceDefinition,
}

/// シェル全体のマニフェスト（`Shell::manifest()` の出力）
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct ShellManifest {
    /// シェル表示名（descript `name`、無ければディレクトリ名）
    pub name: String,
    /// シェル作者名（`craftmanw` / `craftman`）
    pub craftman: Option<String>,
    /// シェルディレクトリ（絶対パス）
    pub directory: String,
    /// `descript.txt` パース結果（全プロパティ）
    pub descript: Descript,
    /// サーフィス定義（番号昇順）
    pub surfaces: Vec<SurfaceManifest>,
    /// `surface.alias` ブロックの エイリアス名 → サーフィス番号列
    pub aliases: BTreeMap<String, Vec<u32>>,
    /// `surfacetable.txt` パース結果（任意）
    pub surface_table: Option<SurfaceTable>,
    /// さくら（\0）の着せ替えパーツ定義
    pub sakura_bind_groups: Vec<BindGroup>,
    /// うにゅう（\1 / kero）の着せ替えパーツ定義
    pub kero_bind_groups: Vec<BindGroup>,
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
            surface_table: self.surface_table.clone(),
            sakura_bind_groups: self.sakura_bind_groups(),
            kero_bind_groups: self.kero_bind_groups(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// 実プロジェクトのサンプルシェル（存在時のみ実行される結合テスト）
    fn mock_shell_dir() -> Option<std::path::PathBuf> {
        let dir =
            std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../../assets/ghost/mock_nanai/shell/master");
        dir.is_dir().then_some(dir)
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
        std::fs::write(dir.join("descript.txt"), "type,shell\nname,manifest_test\ncraftmanw,Tester\n").unwrap();

        let shell = Shell::load(&dir).unwrap();
        let manifest = shell.manifest();

        assert_eq!(manifest.name, "manifest_test");
        assert_eq!(manifest.craftman.as_deref(), Some("Tester"));
        assert_eq!(manifest.descript.type_().map(|s| s.as_str()), Some("shell"));
        assert_eq!(manifest.surfaces.len(), 1);
        assert_eq!(manifest.surfaces[0].number, 0);
        assert_eq!(manifest.surfaces[0].definition.element(0).unwrap().file, "surface0.png");
        assert_eq!(manifest.sakura_bind_groups.len(), 0);

        // JSON 化できる
        let json = serde_json::to_string(&manifest).unwrap();
        assert!(json.contains("\"surfaces\""));
        assert!(json.contains("surface0.png"));
        std::fs::remove_dir_all(&dir).ok();
    }

    #[test]
    fn test_manifest_json_roundtrip_mock_nanai() {
        let Some(dir) = mock_shell_dir() else { return };
        let shell = Shell::load(&dir).unwrap();
        let manifest = shell.manifest();

        // 構造確認
        assert_eq!(manifest.name, "master");
        let s0 = manifest.surfaces.iter().find(|s| s.number == 0).unwrap();
        assert!(s0.definition.collisions.iter().any(|c| c.name == "head"));
        assert!(s0.definition.animations.contains_key(&0));
        assert!(!manifest.sakura_bind_groups.is_empty());
        assert!(!manifest.kero_bind_groups.is_empty());
        assert!(manifest.surface_table.is_some());

        // JSON → 構造体 ラウンドトリップ
        let json = serde_json::to_string(&manifest).unwrap();
        let back: ShellManifest = serde_json::from_str(&json).unwrap();
        assert_eq!(back, manifest);

        // 画像ファイル参照が残っている
        assert!(json.contains("surface0.png"));
    }
}
