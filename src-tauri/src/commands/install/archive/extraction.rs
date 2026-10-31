use super::super::utils::*;
use std::path::Path;

pub fn extract_zip_entries<R: std::io::Read + std::io::Seek>(
    zip: &mut zip::ZipArchive<R>,
    root_prefix: &str,
    target_dir: &Path,
    bundled_resources: &[(String, std::path::PathBuf)],
) -> Result<(), String> {
    for i in 0..zip.len() {
        let mut entry = zip
            .by_index(i)
            .map_err(|e| format!("Failed to read archive entry #{}: {}", i, e))?;

        let decoded_name = decode_zip_entry_name(entry.name_raw());
        let entry_name = decoded_name.replace('\\', "/");

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

        for (src_prefix, dest_dir) in bundled_resources {
            if relative_path.len() >= src_prefix.len()
                && relative_path[..src_prefix.len()].eq_ignore_ascii_case(src_prefix)
            {
                active_target_dir = dest_dir;
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
                .map_err(|e| format!("Failed writing file '{}': {}", out_path.display(), e))?;
            if let Some(mtime) = entry_mtime {
                let _ = outfile.set_modified(mtime);
            }
        }
    }
    Ok(())
}
