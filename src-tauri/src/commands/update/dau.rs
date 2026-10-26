use md5::{Digest, Md5};
use nanai_android_mascot_ui::{open_text_file, Descript};
use std::fs;
use std::path::Path;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct UpdateEntry {
    pub path: String,
    pub md5: String,
    pub size: Option<u64>,
}

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

/// updates2.dau または updates.txt の内容をパース
pub fn parse_update_definition(content: &str) -> Vec<UpdateEntry> {
    let mut entries = Vec::new();
    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }

        // updates.txt の場合: "file," プレフィックス
        let data_part = if let Some(stripped) = trimmed.strip_prefix("file,") {
            stripped
        } else if trimmed.starts_with("charset,") {
            continue;
        } else {
            trimmed
        };

        // 区切り文字: \x01 (Byte 1) または カンマフォールバック
        let parts: Vec<&str> = if data_part.contains('\x01') {
            data_part.split('\x01').collect()
        } else {
            data_part.split(',').collect()
        };

        if parts.is_empty() {
            continue;
        }

        let rel_path = parts[0].trim().replace('\\', "/");
        if rel_path.is_empty() {
            continue;
        }

        let md5_hash = if parts.len() > 1 {
            parts[1].trim().to_lowercase()
        } else {
            String::new()
        };

        let mut size = None;
        for &extra in parts.iter().skip(2) {
            let extra_trimmed = extra.trim();
            if let Some(s) = extra_trimmed.strip_prefix("size=")
                && let Ok(val) = s.parse::<u64>()
            {
                size = Some(val);
            }
        }

        entries.push(UpdateEntry {
            path: rel_path,
            md5: md5_hash,
            size,
        });
    }
    entries
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
