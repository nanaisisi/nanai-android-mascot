use crate::update::types::InstallManifest;
use crate::update::validation::validate_archive_entry_path;
use crate::update::parser::parse_install_manifest;

/// NAR/ZIP アーカイブ インストーラ抽象インターフェース (Slot-15 Contract)
pub trait InstallerEngine {
    /// アーカイブ内の install.txt をパースして InstallManifest を生成
    fn parse_install_manifest(&self, content: &str) -> InstallManifest;

    /// アーカイブエントリパスのセキュリティ検証 (Zip-Slip防止)
    fn validate_entry_path(&self, path: &str) -> Result<(), String> {
        validate_archive_entry_path(path)
    }

    /// 指定ディレクトリ内の refresh 処理対象ファイルをフィルタ（保護マスク判定）
    fn filter_refresh_deletions<'a>(
        &self,
        files: &'a [String],
        manifest: &InstallManifest,
    ) -> Vec<&'a String> {
        if !manifest.refresh {
            return Vec::new();
        }
        files
            .iter()
            .filter(|f| {
                let fname = std::path::Path::new(f)
                    .file_name()
                    .and_then(|n| n.to_str())
                    .unwrap_or(f);
                !manifest.is_refresh_protected(fname)
            })
            .collect()
    }
}

/// 標準の InstallerEngine 実装
#[derive(Debug, Clone, Copy, Default)]
pub struct StandardInstallerEngine;

impl InstallerEngine for StandardInstallerEngine {
    fn parse_install_manifest(&self, content: &str) -> InstallManifest {
        parse_install_manifest(content)
    }
}
