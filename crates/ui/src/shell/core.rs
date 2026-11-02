use crate::descript::{BindGroup, Descript};
use crate::surfaces::{CollisionArea, HitTestResult, SurfaceDefinition, SurfacesTxt};
use crate::surfacetable::SurfaceTable;
use crate::vfs::{open_text_file, resolve_vfs_path};
use std::path::{Path, PathBuf};

use super::loader::read_descript;

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
        let mut surfaces_txt = open_text_file(&surfaces_path)
            .map(|c| SurfacesTxt::parse(&c))
            .unwrap_or_default();

        // surfaces2.txt（SSP拡張オーバーライド）があればマージ
        if let Some(s2_path) = resolve_vfs_path(directory, "surfaces2.txt").filter(|p| p.is_file())
            && let Ok(s2_content) = open_text_file(&s2_path)
        {
            let s2_parsed = SurfacesTxt::parse(&s2_content);
            surfaces_txt.merge(s2_parsed);
        }

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

    /// ソート設定（`collision.sort`）を反映したヒットテスト（HitTestResultを返す）
    pub fn hit_test_result(&self, number: u32, x: i32, y: i32) -> Option<HitTestResult> {
        self.surfaces_txt.hit_test(number, x, y)
    }

    /// バインドパーツのアニメーション当たり判定を含めたヒットテスト
    pub fn hit_test_with_binds(
        &self,
        number: u32,
        x: i32,
        y: i32,
        binds: &[u32],
    ) -> Option<HitTestResult> {
        self.surfaces_txt.hit_test_with_binds(number, x, y, binds)
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
