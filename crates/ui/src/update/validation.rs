use std::path::{Component, Path};

/// アーカイブエントリパスのパストラバーサル（Zip-Slip）および不正コンポーネント検証
pub fn validate_archive_entry_path(path: &str) -> Result<(), String> {
    let normalized = path.replace('\\', "/");
    let trimmed = normalized.trim();
    if trimmed.is_empty() {
        return Err("Archive entry path is empty".to_string());
    }

    if trimmed.starts_with('/') {
        return Err(format!("Absolute path not allowed in archive: {path}"));
    }

    // Reject Windows drive letter prefixes (e.g. C:, D:) regardless of host OS
    let trimmed_bytes = trimmed.as_bytes();
    if trimmed_bytes.len() >= 2
        && trimmed_bytes[0].is_ascii_alphabetic()
        && trimmed_bytes[1] == b':'
    {
        return Err(format!("Drive prefix not allowed in archive: {path}"));
    }

    let p = Path::new(trimmed);
    for component in p.components() {
        match component {
            Component::ParentDir => {
                return Err(format!(
                    "Parent directory traversal ('..') detected: {path}"
                ));
            }
            Component::RootDir | Component::Prefix(_) => {
                return Err(format!(
                    "Root or prefix component not allowed in archive: {path}"
                ));
            }
            _ => {}
        }
    }

    Ok(())
}
