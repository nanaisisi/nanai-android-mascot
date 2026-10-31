mod extraction;
mod inspection;
mod postprocess;

use crate::common::*;
use extraction::extract_zip_entries;
use inspection::inspect_zip_archive;
use postprocess::{build_extracted_ghost_info, process_delete_txt};

pub fn extract_ghost_archive_from_reader<R: std::io::Read + std::io::Seek>(
    mut zip: zip::ZipArchive<R>,
    fallback_name: &str,
    app_handle: &tauri::AppHandle,
) -> Result<GhostInfo, String> {
    let inspection = inspect_zip_archive(&mut zip, fallback_name, app_handle)?;

    let target_base = resolve_asset_path(&inspection.target_base_path, app_handle)?;
    let target_dir = if target_base.join(&inspection.alt_safe_name).exists() {
        target_base.join(&inspection.alt_safe_name)
    } else {
        target_base.join(&inspection.safe_dir_name)
    };

    if !target_dir.exists() {
        std::fs::create_dir_all(&target_dir)
            .map_err(|e| format!("Failed to create destination dir: {}", e))?;
    }

    extract_zip_entries(
        &mut zip,
        &inspection.root_prefix,
        &target_dir,
        &inspection.bundled_resources,
    )?;

    if inspection.kind == "balloon" {
        flatten_balloon_directory(&target_dir)?;
    }

    println!("✅ Archive successfully installed to: {:?}", target_dir);

    process_delete_txt(&target_dir);

    let info = build_extracted_ghost_info(&target_dir, &inspection.safe_dir_name);
    Ok(info)
}
