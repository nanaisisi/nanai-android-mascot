use super::super::utils::*;
use crate::commands::install::normalize_path;

use crate::ui_adapter::update::validate_archive_entry_path;
use std::path::Path;

use super::inspection::BundledResourceTarget;

pub fn extract_zip_entries<R: std::io::Read + std::io::Seek>(
    zip: &mut zip::ZipArchive<R>,
    root_prefix: &str,
    target_dir: &Path,
    bundled_resources: &[BundledResourceTarget],
    password: Option<&str>,
) -> Result<(), String> {
    for i in 0..zip.len() {
        let mut entry = match password {
            Some(pwd) => zip.by_index_decrypt(i, pwd.as_bytes()).map_err(|e| {
                let msg = e.to_string().to_lowercase();
                if msg.contains("password")
                    || msg.contains("encrypted")
                    || msg.contains("decryption")
                {
                    format!("password error (incorrect password or encrypted): {}", e)
                } else {
                    format!("Failed to read archive entry #{}: {}", i, e)
                }
            })?,
            None => zip.by_index(i).map_err(|e| {
                let msg = e.to_string().to_lowercase();
                if msg.contains("password")
                    || msg.contains("encrypted")
                    || msg.contains("decryption")
                {
                    format!("password error (archive is password-protected): {}", e)
                } else {
                    format!("Failed to read archive entry #{}: {}", i, e)
                }
            })?,
        };

        let decoded_name = decode_zip_entry_name(entry.name_raw());
        let entry_name = decoded_name.replace('\\', "/");

        // Zip-Slip事前検証
        validate_archive_entry_path(&entry_name)?;

        let relative_path = if !root_prefix.is_empty() && entry_name.starts_with(root_prefix) {
            &entry_name[root_prefix.len()..]
        } else {
            &entry_name
        };

        if relative_path.is_empty() {
            continue;
        }

        let mut active_target_dir = target_dir;
        let mut active_rel_path = relative_path;

        for res_target in bundled_resources {
            let src_prefix = res_target.source_prefix();
            if relative_path.len() >= src_prefix.len()
                && relative_path[..src_prefix.len()].eq_ignore_ascii_case(src_prefix)
            {
                active_target_dir = res_target.destination_dir();
                active_rel_path = &relative_path[src_prefix.len()..];
                break;
            }
        }

        if active_rel_path.is_empty() {
            continue;
        }

        let out_path = active_target_dir.join(active_rel_path);
        let normalized = normalize_path(&out_path);
        if !normalized.starts_with(active_target_dir) {
            return Err(format!("Illegal path in archive: {}", entry_name));
        }

        if entry.is_dir() {
            std::fs::create_dir_all(&out_path).ok();
        } else {
            if let Some(parent) = out_path.parent() {
                std::fs::create_dir_all(parent).ok();
            }
            let entry_mtime = entry.last_modified().and_then(zip_datetime_to_system_time);
            let mut outfile = std::fs::File::create(&out_path)
                .map_err(|e| format!("Failed to extract '{}': {}", out_path.display(), e))?;
            std::io::copy(&mut entry, &mut outfile).map_err(|e| {
                let msg = e.to_string().to_lowercase();
                if msg.contains("password")
                    || msg.contains("encrypted")
                    || msg.contains("decryption")
                {
                    format!("password error during extraction: {}", e)
                } else {
                    format!("Failed writing file '{}': {}", out_path.display(), e)
                }
            })?;
            if let Some(mtime) = entry_mtime {
                let _ = outfile.set_modified(mtime);
            }
        }
    }
    Ok(())
}

/// Extract a Windows `.cab` archive into `dest_dir` using `expand.exe`.
#[cfg(target_os = "windows")]
pub fn extract_cab_archive(cab_path: &Path, dest_dir: &Path) -> Result<(), String> {
    if !cab_path.is_file() {
        return Err(format!("CAB archive not found: {}", cab_path.display()));
    }
    std::fs::create_dir_all(dest_dir).map_err(|e| {
        format!(
            "Failed to create destination dir '{}': {}",
            dest_dir.display(),
            e
        )
    })?;

    let output = std::process::Command::new("expand.exe")
        .arg(cab_path)
        .arg("-F:*")
        .arg(dest_dir)
        .output()
        .map_err(|e| format!("Failed to execute expand.exe: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        let stdout = String::from_utf8_lossy(&output.stdout);
        return Err(format!(
            "expand.exe failed ({}): {} {}",
            output.status,
            stderr.trim(),
            stdout.trim()
        ));
    }

    Ok(())
}

/// Extract a Windows `.cab` archive into `dest_dir` (unsupported on non-Windows).
#[cfg(not(target_os = "windows"))]
pub fn extract_cab_archive(_cab_path: &Path, _dest_dir: &Path) -> Result<(), String> {
    Err("CAB archive extraction is only supported on Windows".to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_cab_archive_missing_file_returns_err() {
        let temp_dir = std::env::temp_dir().join("nanai_cab_test_missing");
        let missing_cab = temp_dir.join("nonexistent.cab");
        let result = extract_cab_archive(&missing_cab, &temp_dir);
        assert!(result.is_err());
        let _ = std::fs::remove_dir_all(&temp_dir);
    }
}
