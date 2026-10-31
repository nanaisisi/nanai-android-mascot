//! Package a directory into a .nar (ZIP-compliant) archive.

use std::fs::File;
use std::io::{Read, Write};
use std::path::Path;
use walkdir::WalkDir;
use zip::write::SimpleFileOptions;
use zip::ZipWriter;

const IGNORE_FILE_NAMES: &[&str] = &[
    "thumbs.db",
    "desktop.ini",
    ".ds_store",
    ".git",
    ".vscode",
    ".idea",
];

const IGNORE_DIR_NAMES: &[&str] = &[
    ".git",
    ".vscode",
    ".idea",
    "profile",
];

/// Create a .nar archive from `source_dir` and write to `output_nar_path`
pub fn create_nar_from_directory(source_dir: &Path, output_nar_path: &Path) -> Result<u64, String> {
    if !source_dir.is_dir() {
        return Err(format!("Source path '{}' is not a directory", source_dir.display()));
    }

    if let Some(parent) = output_nar_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create output directory for nar: {e}"))?;
    }

    let file = File::create(output_nar_path)
        .map_err(|e| format!("Failed to create output nar file '{}': {e}", output_nar_path.display()))?;

    let mut zip_writer = ZipWriter::new(file);
    let options = SimpleFileOptions::default()
        .compression_method(zip::CompressionMethod::Deflated)
        .unix_permissions(0o755);

    let mut added_count = 0u64;

    for entry in WalkDir::new(source_dir).into_iter().filter_map(|e| e.ok()) {
        let path = entry.path();
        if path == source_dir {
            continue;
        }

        let rel_path = path.strip_prefix(source_dir)
            .map_err(|e| format!("Failed to strip prefix: {e}"))?;
        let name_str = rel_path.to_string_lossy().replace('\\', "/");
        let lower_name = name_str.to_lowercase();

        // Check for ignored files/directories
        let file_name = path.file_name().and_then(|s| s.to_str()).unwrap_or("").to_lowercase();
        if IGNORE_FILE_NAMES.contains(&file_name.as_str()) {
            continue;
        }

        if path.is_dir() {
            if IGNORE_DIR_NAMES.contains(&file_name.as_str()) {
                continue;
            }
            let dir_name = if name_str.ends_with('/') { name_str } else { format!("{name_str}/") };
            zip_writer.add_directory(&dir_name, options)
                .map_err(|e| format!("Failed to add directory '{dir_name}' to nar: {e}"))?;
        } else if path.is_file() {
            if lower_name.contains("/.git/") || lower_name.contains("/profile/") {
                continue;
            }

            zip_writer.start_file(&name_str, options)
                .map_err(|e| format!("Failed to add file '{name_str}' to nar: {e}"))?;

            let mut f = File::open(path)
                .map_err(|e| format!("Failed to read file '{}': {e}", path.display()))?;
            let mut buffer = Vec::new();
            f.read_to_end(&mut buffer)
                .map_err(|e| format!("Failed to read content of '{}': {e}", path.display()))?;

            zip_writer.write_all(&buffer)
                .map_err(|e| format!("Failed to write content of '{name_str}' to nar: {e}"))?;
            added_count += 1;
        }
    }

    zip_writer.finish()
        .map_err(|e| format!("Failed to finalize nar archive: {e}"))?;

    println!("📦 Successfully created NAR archive: {} ({} files)", output_nar_path.display(), added_count);
    Ok(added_count)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    #[test]
    fn test_create_nar_from_directory() {
        let temp_dir = std::env::temp_dir().join("nanai_test_nar_build");
        let source_dir = temp_dir.join("my_ghost_source");
        let output_nar = temp_dir.join("my_ghost.nar");

        let _ = fs::remove_dir_all(&temp_dir);
        fs::create_dir_all(&source_dir).unwrap();

        fs::write(source_dir.join("install.txt"), "type,ghost\nname,TestGhost\n").unwrap();
        fs::write(source_dir.join("readme.txt"), "Ghost Readme\n").unwrap();

        let ghost_dir = source_dir.join("ghost").join("master");
        fs::create_dir_all(&ghost_dir).unwrap();
        fs::write(ghost_dir.join("descript.txt"), "type,ghost\nname,TestGhost\n").unwrap();

        let count = create_nar_from_directory(&source_dir, &output_nar).unwrap();
        assert_eq!(count, 3);
        assert!(output_nar.exists());

        // Read generated ZIP/NAR to verify contents
        let file = File::open(&output_nar).unwrap();
        let mut zip = zip::ZipArchive::new(file).unwrap();
        assert!(zip.by_name("install.txt").is_ok());
        assert!(zip.by_name("readme.txt").is_ok());
        assert!(zip.by_name("ghost/master/descript.txt").is_ok());

        let _ = fs::remove_dir_all(&temp_dir);
    }
}
