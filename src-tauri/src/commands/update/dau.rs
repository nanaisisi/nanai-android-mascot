use md5::{Digest, Md5};
use nanai_android_mascot_ui::{Descript, open_text_file};
pub use nanai_android_mascot_ui::{UpdateEntry, parse_update_definition};
use std::fs;
use std::path::Path;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct UpdateCheckResult {
    pub has_update: bool,
    pub homeurl: String,
    pub ghost_name: String,
    pub update_files: Vec<UpdateEntry>,
    pub total_count: usize,
    pub message: String,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct UpdateExecutionResult {
    pub success: bool,
    pub reason: String, // "changed", "none", "timeout", "md5 miss", "404", "fileio", etc.
    pub updated_files: Vec<String>,
    pub ghost_name: String,
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
    // 1. ghost/master/descript.txt
    let master_desc = ghost_dir.join("ghost").join("master").join("descript.txt");
    if let Ok(content) = open_text_file(&master_desc) {
        let desc = Descript::parse(&content);
        if let Some(url) = desc.homeurl() {
            let mut u = url.trim().to_string();
            if !u.ends_with('/') {
                u.push('/');
            }
            return Some(u);
        }
    }

    // 2. ルートの descript.txt
    let root_desc = ghost_dir.join("descript.txt");
    if let Ok(content) = open_text_file(&root_desc) {
        let desc = Descript::parse(&content);
        if let Some(url) = desc.homeurl() {
            let mut u = url.trim().to_string();
            if !u.ends_with('/') {
                u.push('/');
            }
            return Some(u);
        }
    }

    None
}
