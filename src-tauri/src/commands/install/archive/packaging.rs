//! Package a directory into a .nar (ZIP-compliant) archive.

use std::fs::File;
use std::io::{Read, Write};
use std::path::Path;
use walkdir::WalkDir;
use zip::ZipWriter;
use zip::write::SimpleFileOptions;

// [自動的に除外される対象]: UKADOC / SSP developer_options.txt 仕様自動除外定義
const IGNORE_FILE_NAMES: &[&str] = &[
    "thumbs.db",
    "desktop.ini",
    "folder.htt",
    "mscreate.dir",
    ".ds_store",
    "_catalog.vix",
    ".git",
    ".vscode",
    ".idea",
];

const IGNORE_DIR_NAMES: &[&str] = &[
    "profile",
    "var",
    "__macosx",
    "xtrastuf.mac",
    ".git",
    ".vscode",
    ".idea",
];

fn normalize_nonar_path(raw: &str) -> String {
    let mut s = raw.trim().replace('\\', "/");
    while let Some(stripped) = s.strip_prefix("./") {
        s = stripped.to_string();
    }
    while let Some(stripped) = s.strip_prefix('/') {
        s = stripped.to_string();
    }
    s.trim_end_matches('/').to_string()
}

fn load_nonar_exclusions(source_dir: &Path) -> Vec<String> {
    let dev_opts_path = source_dir.join("developer_options.txt");
    let Ok(content) = std::fs::read_to_string(&dev_opts_path) else {
        return Vec::new();
    };

    let mut exclusions = Vec::new();
    for raw_line in content.lines() {
        let line = raw_line.trim();
        if line.is_empty() || line.starts_with('#') || line.starts_with("//") {
            continue;
        }

        if let Some(rest) = line
            .strip_prefix("nonar=")
            .or_else(|| line.strip_prefix("nonar:"))
        {
            let norm = normalize_nonar_path(rest);
            if !norm.is_empty() {
                exclusions.push(norm);
            }
            continue;
        }

        let mut parts = line.split(',');
        if let Some(path_part) = parts.next() {
            let has_nonar = parts.any(|opt| opt.trim().eq_ignore_ascii_case("nonar"));
            if has_nonar {
                let norm = normalize_nonar_path(path_part);
                if !norm.is_empty() {
                    exclusions.push(norm);
                }
            }
        }
    }

    exclusions
}

fn is_excluded_by_nonar(rel_path_str: &str, exclusions: &[String]) -> bool {
    let norm = rel_path_str.trim_end_matches('/');
    let norm_lower = norm.to_lowercase();
    exclusions.iter().any(|ex| {
        let ex_lower = ex.to_lowercase();
        norm_lower == ex_lower || norm_lower.starts_with(&format!("{ex_lower}/"))
    })
}

/// Create a .nar archive from `source_dir` and write to `output_nar_path`
pub fn create_nar_from_directory(source_dir: &Path, output_nar_path: &Path) -> Result<u64, String> {
    if !source_dir.is_dir() {
        return Err(format!(
            "Source path '{}' is not a directory",
            source_dir.display()
        ));
    }

    if let Some(parent) = output_nar_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create output directory for nar: {e}"))?;
    }

    let file = File::create(output_nar_path).map_err(|e| {
        format!(
            "Failed to create output nar file '{}': {e}",
            output_nar_path.display()
        )
    })?;

    let mut zip_writer = ZipWriter::new(file);
    let options = SimpleFileOptions::default()
        .compression_method(zip::CompressionMethod::Deflated)
        .unix_permissions(0o755);

    let nonar_exclusions = load_nonar_exclusions(source_dir);
    let nar_filter =
        crate::ghost::scan::directory::package_files::IncludeFilter::load_nar(source_dir);
    let mut added_count = 0u64;

    for entry in WalkDir::new(source_dir).into_iter().filter_map(|e| e.ok()) {
        let path = entry.path();
        if path == source_dir {
            continue;
        }

        let rel_path = path
            .strip_prefix(source_dir)
            .map_err(|e| format!("Failed to strip prefix: {e}"))?;
        let name_str = rel_path.to_string_lossy().replace('\\', "/");
        let lower_name = name_str.to_lowercase();

        if is_excluded_by_nonar(&name_str, &nonar_exclusions)
            || (path.is_file() && nar_filter.excludes(&name_str))
        {
            continue;
        }

        // Check for ignored files/directories
        let file_name = path
            .file_name()
            .and_then(|s| s.to_str())
            .unwrap_or("")
            .to_lowercase();
        if IGNORE_FILE_NAMES.contains(&file_name.as_str()) {
            continue;
        }

        if path.is_dir() {
            if IGNORE_DIR_NAMES.contains(&file_name.as_str()) {
                continue;
            }
            let dir_name = if name_str.ends_with('/') {
                name_str
            } else {
                format!("{name_str}/")
            };
            zip_writer
                .add_directory(&dir_name, options)
                .map_err(|e| format!("Failed to add directory '{dir_name}' to nar: {e}"))?;
        } else if path.is_file() {
            if lower_name.contains("/.git/") || lower_name.contains("/profile/") {
                continue;
            }

            zip_writer
                .start_file(&name_str, options)
                .map_err(|e| format!("Failed to add file '{name_str}' to nar: {e}"))?;

            let mut f = File::open(path)
                .map_err(|e| format!("Failed to read file '{}': {e}", path.display()))?;
            let mut buffer = Vec::new();
            f.read_to_end(&mut buffer)
                .map_err(|e| format!("Failed to read content of '{}': {e}", path.display()))?;

            zip_writer
                .write_all(&buffer)
                .map_err(|e| format!("Failed to write content of '{name_str}' to nar: {e}"))?;
            added_count += 1;
        }
    }

    zip_writer
        .finish()
        .map_err(|e| format!("Failed to finalize nar archive: {e}"))?;

    println!(
        "📦 Successfully created NAR archive: {} ({} files)",
        output_nar_path.display(),
        added_count
    );
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

        fs::write(
            source_dir.join("install.txt"),
            "type,ghost\nname,TestGhost\n",
        )
        .unwrap();
        fs::write(source_dir.join("readme.txt"), "Ghost Readme\n").unwrap();

        let ghost_dir = source_dir.join("ghost").join("master");
        fs::create_dir_all(&ghost_dir).unwrap();
        fs::write(
            ghost_dir.join("descript.txt"),
            "type,ghost\nname,TestGhost\n",
        )
        .unwrap();

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

    #[test]
    fn test_create_nar_respects_developer_options_nonar() {
        let temp_dir = std::env::temp_dir().join("nanai_test_nar_nonar");
        let source_dir = temp_dir.join("ghost_src");
        let output_nar = temp_dir.join("ghost_nonar.nar");

        let _ = fs::remove_dir_all(&temp_dir);
        fs::create_dir_all(source_dir.join("secret_dir")).unwrap();
        fs::create_dir_all(source_dir.join("ghost").join("master")).unwrap();

        fs::write(
            source_dir.join("developer_options.txt"),
            "./secret_dir,nonar,noupdate\nnonar=draft.txt\nnonar:\\ghost\\master\\notes.txt\n",
        )
        .unwrap();
        fs::write(source_dir.join("readme.txt"), "Public\n").unwrap();
        fs::write(source_dir.join("draft.txt"), "Draft\n").unwrap();
        fs::write(source_dir.join("secret_dir").join("key.txt"), "Secret\n").unwrap();
        fs::write(
            source_dir.join("ghost").join("master").join("descript.txt"),
            "name,Test\n",
        )
        .unwrap();
        fs::write(
            source_dir.join("ghost").join("master").join("notes.txt"),
            "Notes\n",
        )
        .unwrap();

        let count = create_nar_from_directory(&source_dir, &output_nar).unwrap();
        assert_eq!(count, 3); // developer_options.txt, readme.txt, ghost/master/descript.txt

        let file = File::open(&output_nar).unwrap();
        let mut zip = zip::ZipArchive::new(file).unwrap();
        assert!(zip.by_name("readme.txt").is_ok());
        assert!(zip.by_name("ghost/master/descript.txt").is_ok());
        assert!(zip.by_name("draft.txt").is_err());
        assert!(zip.by_name("secret_dir/key.txt").is_err());
        assert!(zip.by_name("ghost/master/notes.txt").is_err());

        let _ = fs::remove_dir_all(&temp_dir);
    }
}
