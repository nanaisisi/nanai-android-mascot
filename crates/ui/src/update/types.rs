use crate::update::parser::parse_update_definition;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, PartialEq, Eq)]
pub struct UpdateEntry {
    pub path: String,
    pub md5: String,
    pub size: Option<u64>,
    #[serde(default)]
    pub is_delete: bool,
    #[serde(default)]
    pub is_ignore: bool,
    #[serde(default)]
    pub is_readonly: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub date: Option<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub flags: Vec<String>,
}

impl UpdateEntry {
    /// 削除対象 (`delete` フラグ指定) かどうか判定
    pub fn is_delete(&self) -> bool {
        self.flags.iter().any(|f| f.eq_ignore_ascii_case("delete"))
    }

    /// 更新除外対象 (`ignore` フラグ指定) かどうか判定
    pub fn is_ignore(&self) -> bool {
        self.flags.iter().any(|f| f.eq_ignore_ascii_case("ignore"))
    }

    /// 読取専用 (`readonly` フラグ指定) かどうか判定
    pub fn is_readonly(&self) -> bool {
        self.flags
            .iter()
            .any(|f| f.eq_ignore_ascii_case("readonly"))
    }
}

/// ネットワーク更新パッケージ定義 (Slot-15 Contract)
#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize, PartialEq, Eq)]
pub struct UpdatePackage {
    pub entries: Vec<UpdateEntry>,
}

impl UpdatePackage {
    pub fn from_definition(content: &str) -> Self {
        Self {
            entries: parse_update_definition(content),
        }
    }

    /// 更新対象（非delete、非ignore）の有効なエントリ一覧を取得
    pub fn active_downloads(&self) -> Vec<&UpdateEntry> {
        self.entries
            .iter()
            .filter(|e| !e.is_delete && !e.is_ignore)
            .collect()
    }

    /// 削除対象 (`delete` フラグ指定) のエントリ一覧を取得
    pub fn deletions(&self) -> Vec<&UpdateEntry> {
        self.entries.iter().filter(|e| e.is_delete).collect()
    }

    /// 総ダウンロード予定サイズ (サイズが指定されているエントリの合算)
    pub fn total_download_size(&self) -> u64 {
        self.active_downloads().iter().filter_map(|e| e.size).sum()
    }

    /// パスに合致するエントリを取得
    pub fn find_entry(&self, path: &str) -> Option<&UpdateEntry> {
        let norm = path.replace('\\', "/");
        self.entries
            .iter()
            .find(|e| e.path.eq_ignore_ascii_case(&norm))
    }

    /// 複数パスリストから合致するエントリ一覧を取得
    pub fn find_entries<'a>(&'a self, paths: &[&str]) -> Vec<&'a UpdateEntry> {
        paths
            .iter()
            .filter_map(|p| self.find_entry(p))
            .collect()
    }

    /// ローカル既存ファイルパスとMD5ペアから、未更新またはMD5が異なる更新対象エントリのみを抽出
    pub fn pending_downloads(&self, local_checksums: &std::collections::HashMap<String, String>) -> Vec<&UpdateEntry> {
        self.active_downloads()
            .into_iter()
            .filter(|e| {
                let norm = e.path.replace('\\', "/");
                match local_checksums.get(&norm) {
                    Some(local_md5) => !local_md5.eq_ignore_ascii_case(&e.md5),
                    None => true,
                }
            })
            .collect()
    }
}

/// 同梱リソース設定（balloon, headline, plugin, shell, calendar.skin 等）
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, PartialEq, Eq)]
pub struct InstallResourceConfig {
    pub resource_type: String,
    pub target_directory: String,
    pub source_directory: String,
    pub refresh: bool,
    pub refresh_undelete_mask: Vec<String>,
}

/// install.txt の解析結果モデル (Slot-15 Contract)
#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize, PartialEq, Eq)]
pub struct InstallManifest {
    pub name: String,
    pub install_type: String,
    pub directory: Option<String>,
    pub charset: Option<String>,
    pub accept: Option<String>,
    pub bootghost: Option<String>,
    pub refresh: bool,
    pub refresh_undelete_mask: Vec<String>,
    pub notice: Option<String>,
    pub readme: Option<String>,
    pub execute: Option<String>,
    pub oninstall_script: Option<String>,
    pub onuninstall_script: Option<String>,
    pub bundled_resources: Vec<InstallResourceConfig>,
}

impl InstallManifest {
    /// ターゲットディレクトリ名を取得（未指定時は name をフォールバック）
    pub fn effective_directory(&self) -> &str {
        self.directory.as_deref().unwrap_or(&self.name)
    }

    /// 特定ファイルが refreshundeletemask に合致して保護されるか判定
    pub fn is_refresh_protected(&self, filename: &str) -> bool {
        self.refresh_undelete_mask
            .iter()
            .any(|mask| mask.eq_ignore_ascii_case(filename))
    }

    /// accept 設定に基づき、現在稼働中/対象のゴーストにインストール受入可能か判定
    /// accept 未指定時は常に true
    pub fn is_acceptable_by(&self, ghost_name: &str) -> bool {
        let Some(accept_str) = &self.accept else {
            return true;
        };
        let target = ghost_name.trim();
        accept_str
            .split(',')
            .any(|item| item.trim().eq_ignore_ascii_case(target))
    }

    /// インストール拒否理由を評価 (UKADOC OnInstallRefuse 準拠)
    pub fn evaluate_refusal(&self, current_ghost_name: &str) -> Option<&'static str> {
        if self.name.trim().is_empty() {
            return Some("invalid name");
        }
        if !self.is_acceptable_by(current_ghost_name) {
            return Some("accept failed");
        }
        None
    }

    /// 同梱リソースを含めた同時インストール（複数リソース展開）かどうか判定
    pub fn is_multi_install(&self) -> bool {
        !self.bundled_resources.is_empty()
    }

    /// アーカイブ展開対象の全ターゲットディレクトリ名（主ディレクトリ + 同梱リソース）
    pub fn all_target_directories(&self) -> Vec<&str> {
        let mut dirs = Vec::new();
        let eff = self.effective_directory();
        if !eff.is_empty() {
            dirs.push(eff);
        }
        for res in &self.bundled_resources {
            if !res.target_directory.is_empty() && !dirs.contains(&res.target_directory.as_str()) {
                dirs.push(&res.target_directory);
            }
        }
        dirs
    }
}
