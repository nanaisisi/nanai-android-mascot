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
                if msg.contains("password") || msg.contains("encrypted") || msg.contains("decryption") {
                    format!("password error (incorrect password or encrypted): {}", e)
                } else {
                    format!("Failed to read archive entry #{}: {}", i, e)
                }
            })?,
            None => zip.by_index(i).map_err(|e| {
                let msg = e.to_string().to_lowercase();
                if msg.contains("password") || msg.contains("encrypted") || msg.contains("decryption") {
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
            std::io::copy(&mut entry, &mut outfile)
                .map_err(|e| {
                    let msg = e.to_string().to_lowercase();
                    if msg.contains("password") || msg.contains("encrypted") || msg.contains("decryption") {
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
