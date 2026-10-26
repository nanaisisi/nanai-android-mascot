//! シェル読込ランタイムモデル（ukadoc-spec / descript / shell 準拠）
//!
//! シェルディレクトリから `descript.txt` / `surfaces.txt` / `surfacetable.txt`
//! を読み込み（Shift_JIS / UTF-8 自動判別・VFS 大文字小文字吸収）、
//! 描画・当たり判定・着せ替え解決に使う構造体にまとめる。

use crate::descript::{BindGroup, Descript};
use crate::surfaces::{CollisionArea, SurfaceDefinition, SurfacesTxt};
use crate::surfacetable::SurfaceTable;
use crate::vfs::{open_text_file, resolve_vfs_path};
use std::path::{Path, PathBuf};

/// 読み込んだシェルの統合ビュー
#[derive(Debug, Clone, Default)]
pub struct Shell {
    /// シェルディレクトリ（ghost/<ghost>/shell/<shell>/）
    pub directory: PathBuf,
    /// `descript.txt`（type / name / craftmanw / bindgroup 等）
    pub descript: Descript,
    /// `surfaces.txt`（Element / SERIKO / Collision）
    pub surfaces_txt: SurfacesTxt,
    /// `surfacetable.txt`（任意・サーフィスグループ一覧）
    pub surface_table: Option<SurfaceTable>,
}

impl Shell {
    /// シェルディレクトリを読み込む。`surfaces.txt` が無い場合はエラー。
    pub fn load(directory: &Path) -> Result<Self, std::io::Error> {
        if !directory.is_dir() {
            return Err(std::io::Error::new(
                std::io::ErrorKind::NotFound,
                format!("shell directory not found: {}", directory.display()),
            ));
        }
        let surfaces_path = resolve_vfs_path(directory, "surfaces.txt")
            .filter(|p| p.is_file())
            .ok_or_else(|| {
                std::io::Error::new(
                    std::io::ErrorKind::NotFound,
                    format!("surfaces.txt not found under {}", directory.display()),
                )
            })?;

        let descript = read_descript(directory).unwrap_or_default();
        let surfaces_txt = {
            let content = open_text_file(&surfaces_path)?;
            SurfacesTxt::parse(&content)
        };
        let surface_table = resolve_vfs_path(directory, "surfacetable.txt")
            .filter(|p| p.is_file())
            .and_then(|p| open_text_file(&p).ok())
            .map(|content| SurfaceTable::parse(&content));

        Ok(Self {
            directory: directory.to_path_buf(),
            descript,
            surfaces_txt,
            surface_table,
        })
    }

    /// サーフィス番号の定義を取得
    pub fn surface(&self, number: u32) -> Option<&SurfaceDefinition> {
        self.surfaces_txt.surface(number)
    }

    /// `surface.alias` ブロック（エイリアス名）からサーフィス定義を解決する
    pub fn alias_surface(&self, name: &str) -> Option<&SurfaceDefinition> {
        self.surfaces_txt.resolve_alias(name)
    }

    /// サーフィスへの当たり判定ヒットテスト（部位名を返す）
    pub fn hit_test(&self, number: u32, x: i32, y: i32) -> Option<&CollisionArea> {
        self.surface(number).and_then(|def| def.hit_test(x, y))
    }

    /// surfacetable の名前解決（任意定義時のみ）
    pub fn surface_display_name(&self, number: u32) -> Option<&str> {
        self.surface_table.as_ref().and_then(|t| t.name_of(number))
    }

    /// さくら（\0）の着せ替えパーツ定義
    pub fn sakura_bind_groups(&self) -> Vec<BindGroup> {
        self.bind_groups("sakura")
    }

    /// うにゅう（\1 / kero）の着せ替えパーツ定義
    pub fn kero_bind_groups(&self) -> Vec<BindGroup> {
        self.bind_groups("kero")
    }

    /// 指定キャラ（sakura / kero / charN）の着せ替えパーツ定義
    pub fn bind_groups(&self, target: &str) -> Vec<BindGroup> {
        self.descript.bind_groups(target)
    }

    /// シェル表示名（descript `name`）。無ければディレクトリ名。
    pub fn display_name(&self) -> String {
        self.descript
            .name()
            .cloned()
            .unwrap_or_else(|| self.directory_name())
    }

    /// シェル作者名（`craftmanw` / `craftman`）
    pub fn craftman(&self) -> Option<&String> {
        self.descript.craftmanw()
    }

    /// 選択キャラの「既定装着」として指定された bind アニメーションID列
    /// （descript `[target].bindgroup[N].default,1` の集まり）
    pub fn default_bind_ids(&self, target: &str) -> Vec<u32> {
        self.descript
            .bind_groups(target)
            .into_iter()
            .filter(|g| g.default)
            .map(|g| g.number)
            .collect()
    }

    /// 現在の着せ替え状態から合成レイヤー計画を立てる
    pub fn composition_plan(
        &self,
        surface: u32,
        binds: &[u32],
    ) -> Option<crate::surfaces::CompositionPlan> {
        self.surfaces_txt.plan_composition(surface, binds)
    }

    /// シェル内の画像ファイルを相対解決する
    pub fn resolve_asset(&self, relative: &str) -> Option<PathBuf> {
        resolve_vfs_path(&self.directory, relative)
    }

    /// ディレクトリ名（シェル内部名のフォールバック）
    pub fn directory_name(&self) -> String {
        self.directory
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or_default()
            .to_string()
    }
}

/// `descript.txt` を読み込む（無い場合や読込失敗時は空 descript）
fn read_descript(directory: &Path) -> Option<Descript> {
    let path = resolve_vfs_path(directory, "descript.txt")?;
    if !path.is_file() {
        return None;
    }
    let content = open_text_file(&path).ok()?;
    Some(Descript::parse(&content))
}

#[cfg(test)]
mod tests {
    use super::*;

    /// 実プロジェクトのサンプルシェル（存在時のみ実行される結合テスト）
    fn mock_shell_dir() -> Option<PathBuf> {
        let dir = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../../assets/ghost/mock_nanai/shell/master");
        dir.is_dir().then_some(dir)
    }

    #[test]
    fn test_load_mock_shell() {
        let Some(dir) = mock_shell_dir() else { return };
        let shell = Shell::load(&dir).unwrap();

        assert_eq!(shell.directory_name(), "master");
        assert_eq!(shell.descript.type_().map(|s| s.as_str()), Some("shell"));
        assert_eq!(shell.display_name(), "master");
        assert!(shell.craftman().is_some());

        // surfaces.txt の基本定義
        let def0 = shell.surface(0).unwrap();
        assert!(def0.element(0).is_some());
        assert!(def0.collisions.iter().any(|c| c.name == "head"));

        // hit_test
        assert_eq!(
            shell.hit_test(0, 90, 40).map(|c| c.name.as_str()),
            Some("head")
        );
        assert_eq!(shell.hit_test(0, -99, -99), None);

        // 着せ替え定義（mock_nanai は sakura / kero とも bindgroup を持つ）
        assert!(!shell.sakura_bind_groups().is_empty());
        assert!(!shell.kero_bind_groups().is_empty());

        // 既定装着の bind id と合成計画
        if let Some(default_id) = shell.default_bind_ids("sakura").first().copied() {
            let plan = shell.composition_plan(0, &[default_id]).unwrap();
            assert!(plan.bind_pattern_count() >= 1);
        }

        // surfacetable.txt も存在する（グループ一覧）
        if let Some(table) = &shell.surface_table {
            assert_eq!(table.version, 1);
            assert!(!table.visible_entries().is_empty());
        }

        // アセット解決（VFS 大文字小文字吸収含む）
        assert!(shell.resolve_asset("surface0.png").is_some());
        assert!(shell.resolve_asset("Surface0.PNG").is_some());
    }

    #[test]
    fn test_load_missing_directory() {
        let err = Shell::load(Path::new("definitely/not/exist")).unwrap_err();
        assert_eq!(err.kind(), std::io::ErrorKind::NotFound);
    }
}
