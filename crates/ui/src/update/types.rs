use crate::update::parser::parse_update_definition;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, PartialEq, Eq)]
pub struct UpdateEntry {
    pub(crate) path: String,
    pub(crate) md5: String,
    pub(crate) size: Option<u64>,
    #[serde(default)]
    pub(crate) is_delete: bool,
    #[serde(default)]
    pub(crate) is_ignore: bool,
    #[serde(default)]
    pub(crate) is_readonly: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(crate) date: Option<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub(crate) flags: Vec<String>,
}

#[allow(dead_code)]
impl UpdateEntry {
    // Add getter methods
    pub fn path(&self) -> &str { &self.path }
    pub fn md5(&self) -> &str { &self.md5 }
    pub fn size(&self) -> Option<u64> { self.size }
    pub fn is_delete_flag(&self) -> bool { self.is_delete }
    pub fn is_ignore_flag(&self) -> bool { self.is_ignore }
    pub fn is_readonly_flag(&self) -> bool { self.is_readonly }
    pub fn date(&self) -> Option<&str> { self.date.as_deref() }
    pub fn flags(&self) -> &[String] { &self.flags }

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

/// ネットワーク更新進捗サマリー (Slot-15 Contract)
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, PartialEq, Eq)]
pub struct UpdateProgressSummary {
    pub(crate) total_entries: usize,
    pub(crate) active_downloads: usize,
    pub(crate) completed_entries: usize,
    pub(crate) deletions: usize,
    pub(crate) total_bytes: u64,
    pub(crate) is_finished: bool,
}

#[allow(dead_code)]
impl UpdateProgressSummary {
    // Add getter methods
    pub fn total_entries(&self) -> usize { self.total_entries }
    pub fn active_downloads(&self) -> usize { self.active_downloads }
    pub fn completed_entries(&self) -> usize { self.completed_entries }
    pub fn deletions(&self) -> usize { self.deletions }
    pub fn total_bytes(&self) -> u64 { self.total_bytes }
    pub fn is_finished(&self) -> bool { self.is_finished }
}

/// ネットワーク更新計画 (差分分類結果)
#[derive(Debug, Clone, Default, serde::Serialize, PartialEq, Eq)]
pub struct UpdatePlan<'a> {
    pub(crate) additions: Vec<&'a UpdateEntry>,
    pub(crate) modifications: Vec<&'a UpdateEntry>,
    pub(crate) deletions: Vec<&'a UpdateEntry>,
    pub(crate) unchanged: Vec<&'a UpdateEntry>,
}

#[allow(dead_code)]
impl<'a> UpdatePlan<'a> {
    // Add getter methods
    pub fn additions(&self) -> &[&'a UpdateEntry] { &self.additions }
    pub fn modifications(&self) -> &[&'a UpdateEntry] { &self.modifications }
    pub fn deletions(&self) -> &[&'a UpdateEntry] { &self.deletions }
    pub fn unchanged(&self) -> &[&'a UpdateEntry] { &self.unchanged }

    pub fn total_changes(&self) -> usize {
        self.additions.len() + self.modifications.len() + self.deletions.len()
    }

    pub fn has_changes(&self) -> bool {
        self.total_changes() > 0
    }
}

/// ネットワーク更新パッケージ定義 (Slot-15 Contract)
#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize, PartialEq, Eq)]
pub struct UpdatePackage {
    pub(crate) entries: Vec<UpdateEntry>,
}

#[allow(dead_code)]
impl UpdatePackage {
    // Add getter methods
    pub fn entries(&self) -> &[UpdateEntry] { &self.entries }

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
        paths.iter().filter_map(|p| self.find_entry(p)).collect()
    }

    /// ローカル既存ファイルパスとMD5ペアから、未更新またはMD5が異なる更新対象エントリのみを抽出
    pub fn pending_downloads(
        &self,
        local_checksums: &std::collections::HashMap<String, String>,
    ) -> Vec<&UpdateEntry> {
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

    /// 更新進行状況サマリーを計算
    pub fn progress_summary(&self, completed_count: usize) -> UpdateProgressSummary {
        let active = self.active_downloads();
        let total_active = active.len();
        let deletions = self.deletions().len();
        let total_bytes = self.total_download_size();
        let is_finished = completed_count >= total_active;

        UpdateProgressSummary {
            total_entries: self.entries.len(),
            active_downloads: total_active,
            completed_entries: completed_count.min(total_active),
            deletions,
            total_bytes,
            is_finished,
        }
    }

    /// ローカル既存ファイル情報に基づき更新計画（新規・上書き・削除・変更なし）を作成
    pub fn plan_update<'a>(
        &'a self,
        local_checksums: &std::collections::HashMap<String, String>,
    ) -> UpdatePlan<'a> {
        let mut plan = UpdatePlan::default();

        for entry in &self.entries {
            if entry.is_delete {
                plan.deletions.push(entry);
                continue;
            }
            if entry.is_ignore {
                plan.unchanged.push(entry);
                continue;
            }

            let norm = entry.path.replace('\\', "/");
            match local_checksums.get(&norm) {
                None => {
                    plan.additions.push(entry);
                }
                Some(local_md5) => {
                    if local_md5.eq_ignore_ascii_case(&entry.md5) {
                        plan.unchanged.push(entry);
                    } else {
                        plan.modifications.push(entry);
                    }
                }
            }
        }

        plan
    }

    /// developer_options.txt の noupdate パターンに合致するファイルを除外したエントリ一覧を取得
    pub fn filter_noupdate(&self, noupdate_patterns: &[&str]) -> Vec<&UpdateEntry> {
        self.entries
            .iter()
            .filter(|e| {
                let norm = e.path.replace('\\', "/");
                !noupdate_patterns.iter().any(|pattern| {
                    let pat_norm = pattern.replace('\\', "/");
                    norm.eq_ignore_ascii_case(&pat_norm)
                        || norm.ends_with(&format!("/{}", pat_norm.trim_start_matches('/')))
                })
            })
            .collect()
    }

    /// エントリのハッシュおよびパスの健全性検証（32文字の16進MD5または空、不正な制御文字等）
    pub fn validate_entries_integrity(&self) -> Result<(), String> {
        for entry in &self.entries {
            if entry.path.trim().is_empty() {
                return Err("Empty path in update entry".to_string());
            }
            if entry.path.contains('\0') {
                return Err(format!("Null byte in update path: {}", entry.path));
            }
            if !entry.md5.is_empty() {
                if entry.md5.len() != 32 {
                    return Err(format!(
                        "Invalid MD5 hash length ({}) for path: {}",
                        entry.md5.len(),
                        entry.path
                    ));
                }
                if !entry.md5.chars().all(|c| c.is_ascii_hexdigit()) {
                    return Err(format!(
                        "Invalid hex characters in MD5 hash for path: {}",
                        entry.path
                    ));
                }
            }
        }
        Ok(())
    }
}

/// 同梱リソース設定（balloon, headline, plugin, shell, calendar.skin 等）
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, PartialEq, Eq)]
pub struct InstallResourceConfig {
    pub(crate) resource_type: String,
    pub(crate) target_directory: String,
    pub(crate) source_directory: String,
    pub(crate) refresh: bool,
    pub(crate) refresh_undelete_mask: Vec<String>,
}

#[allow(dead_code)]
impl InstallResourceConfig {
    // Add getter methods
    pub fn resource_type(&self) -> &str { &self.resource_type }
    pub fn target_directory(&self) -> &str { &self.target_directory }
    pub fn source_directory(&self) -> &str { &self.source_directory }
    pub fn refresh(&self) -> bool { self.refresh }
    pub fn refresh_undelete_mask(&self) -> &[String] { &self.refresh_undelete_mask }

    pub fn new(
        resource_type: impl Into<String>,
        target_directory: impl Into<String>,
        source_directory: impl Into<String>,
        refresh: bool,
        refresh_undelete_mask: Vec<String>,
    ) -> Self {
        Self {
            resource_type: resource_type.into(),
            target_directory: target_directory.into(),
            source_directory: source_directory.into(),
            refresh,
            refresh_undelete_mask,
        }
    }
}

/// install.txt の解析結果モデル (Slot-15 Contract)
#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize, PartialEq, Eq)]
pub struct InstallManifest {
    pub(crate) name: String,
    pub(crate) install_type: String,
    pub(crate) directory: Option<String>,
    pub(crate) charset: Option<String>,
    pub(crate) accept: Option<String>,
    pub(crate) bootghost: Option<String>,
    pub(crate) refresh: bool,
    pub(crate) refresh_undelete_mask: Vec<String>,
    pub(crate) notice: Option<String>,
    pub(crate) readme: Option<String>,
    pub(crate) execute: Option<String>,
    pub(crate) oninstall_script: Option<String>,
    pub(crate) onuninstall_script: Option<String>,
    pub(crate) bundled_resources: Vec<InstallResourceConfig>,
}

#[allow(dead_code)]
impl InstallManifest {
    // Add getter methods
    pub fn name(&self) -> &str { &self.name }
    pub fn install_type(&self) -> &str { &self.install_type }
    pub fn directory(&self) -> Option<&str> { self.directory.as_deref() }
    pub fn charset(&self) -> Option<&str> { self.charset.as_deref() }
    pub fn accept(&self) -> Option<&str> { self.accept.as_deref() }
    pub fn bootghost(&self) -> Option<&str> { self.bootghost.as_deref() }
    pub fn refresh(&self) -> bool { self.refresh }
    pub fn refresh_undelete_mask(&self) -> &[String] { &self.refresh_undelete_mask }
    pub fn notice(&self) -> Option<&str> { self.notice.as_deref() }
    pub fn readme(&self) -> Option<&str> { self.readme.as_deref() }
    pub fn execute(&self) -> Option<&str> { self.execute.as_deref() }
    pub fn oninstall_script(&self) -> Option<&str> { self.oninstall_script.as_deref() }
    pub fn onuninstall_script(&self) -> Option<&str> { self.onuninstall_script.as_deref() }
    pub fn bundled_resources(&self) -> &[InstallResourceConfig] { &self.bundled_resources }

    /// インストール対象種別の正規化 ("ghost", "shell", "balloon" など小文字化)
    pub fn normalized_install_type(&self) -> String {
        self.install_type.trim().to_lowercase()
    }

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
