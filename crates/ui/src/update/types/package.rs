//! ネットワーク更新パッケージ、進捗サマリー、差分更新計画モデル

use super::super::parser::parse_update_definition;
use super::entry::UpdateEntry;

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
    pub fn total_entries(&self) -> usize {
        self.total_entries
    }
    pub fn active_downloads(&self) -> usize {
        self.active_downloads
    }
    pub fn completed_entries(&self) -> usize {
        self.completed_entries
    }
    pub fn deletions(&self) -> usize {
        self.deletions
    }
    pub fn total_bytes(&self) -> u64 {
        self.total_bytes
    }
    pub fn is_finished(&self) -> bool {
        self.is_finished
    }
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
    pub fn additions(&self) -> &[&'a UpdateEntry] {
        &self.additions
    }
    pub fn modifications(&self) -> &[&'a UpdateEntry] {
        &self.modifications
    }
    pub fn deletions(&self) -> &[&'a UpdateEntry] {
        &self.deletions
    }
    pub fn unchanged(&self) -> &[&'a UpdateEntry] {
        &self.unchanged
    }

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
    pub fn entries(&self) -> &[UpdateEntry] {
        &self.entries
    }

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
