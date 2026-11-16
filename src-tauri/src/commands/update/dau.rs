use crate::commands::update::open_text_file;
use crate::ui_adapter::shell::Descript;
pub use crate::ui_adapter::update::{UpdateEntry, parse_update_definition};
use md5::{Digest, Md5};
use std::fs;
use std::path::Path;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct UpdateCheckResult {
    has_update: bool,
    homeurl: String,
    ghost_name: String,
    update_files: Vec<UpdateEntry>,
    total_count: usize,
    message: String,
}

impl UpdateCheckResult {
    pub fn new(
        has_update: bool,
        homeurl: String,
        ghost_name: String,
        update_files: Vec<UpdateEntry>,
        total_count: usize,
        message: String,
    ) -> Self {
        Self {
            has_update,
            homeurl,
            ghost_name,
            update_files,
            total_count,
            message,
        }
    }

    // Add getter methods
    pub fn has_update(&self) -> bool {
        self.has_update
    }

    pub fn homeurl(&self) -> &str {
        &self.homeurl
    }

    pub fn ghost_name(&self) -> &str {
        &self.ghost_name
    }

    pub fn update_files(&self) -> &[UpdateEntry] {
        &self.update_files
    }

    #[allow(dead_code)]
    pub fn total_count(&self) -> usize {
        self.total_count
    }

    #[allow(dead_code)]
    pub fn message(&self) -> &str {
        &self.message
    }
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct UpdateExecutionResult {
    success: bool,
    reason: String, // "changed", "none", "timeout", "md5 miss", "404", "fileio", etc.
    updated_files: Vec<String>,
    ghost_name: String,
}

#[allow(dead_code)]
impl UpdateExecutionResult {
    pub fn new(
        success: bool,
        reason: String,
        updated_files: Vec<String>,
        ghost_name: String,
    ) -> Self {
        Self {
            success,
            reason,
            updated_files,
            ghost_name,
        }
    }

    // Add getter methods
    pub fn success(&self) -> bool {
        self.success
    }
    pub fn reason(&self) -> &str {
        &self.reason
    }
    pub fn updated_files(&self) -> &[String] {
        &self.updated_files
    }
    pub fn ghost_name(&self) -> &str {
        &self.ghost_name
    }
}

/// ローカルファイルの MD5 ハッシュを計算
pub fn calculate_file_md5(path: &Path) -> Option<String> {
    if !path.exists() || !path.is_file() {
        return None;
    }
    let data = fs::read(path).ok()?;
    let mut hasher = Md5::new();
    hasher.update(&data);
    let hash = hasher.finalize();
    let hex_str: String = hash.iter().map(|b| format!("{:02x}", b)).collect();
    Some(hex_str)
}

/// ゴーストの homeurl を取得
pub fn get_ghost_homeurl(ghost_dir: &Path) -> Option<String> {
    for desc_path in [
        ghost_dir.join("ghost").join("master").join("descript.txt"),
        ghost_dir.join("descript.txt"),
    ] {
        if let Ok(content) = open_text_file(&desc_path) {
            let desc = Descript::parse(&content);
            let url_opt = desc
                .homeurl()
                .map(ToString::to_string)
                .or_else(|| desc.properties().get("updateurl").cloned())
                .or_else(|| desc.properties().get("update.url").cloned())
                .or_else(|| desc.properties().get("home.url").cloned());

            if let Some(url) = url_opt {
                let mut u = url.trim().to_string();
                if !u.is_empty() {
                    if !u.ends_with('/') {
                        u.push('/');
                    }
                    return Some(u);
                }
            }
        }
    }

    None
}
