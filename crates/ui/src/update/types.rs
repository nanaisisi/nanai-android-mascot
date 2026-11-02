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
}
