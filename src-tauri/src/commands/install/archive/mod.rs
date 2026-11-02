mod extraction;
mod inspection;
mod packaging;
mod postprocess;

pub use packaging::create_nar_from_directory;
pub use postprocess::{perform_refresh_cleanup, process_delete_txt};

use super::utils::flatten_balloon_directory;
use crate::common::*;
use extraction::extract_zip_entries;
use inspection::inspect_zip_archive;
use postprocess::build_extracted_ghost_info;

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

    // refresh 指定時のディレクトリクリーンアップ（メインターゲット）
    if inspection.refresh {
        println!(
            "🧹 Performing refresh cleanup on target_dir: {:?} (masks: {:?})",
            target_dir, inspection.refresh_undelete_mask
        );
        perform_refresh_cleanup(&target_dir, &inspection.refresh_undelete_mask);
    }

    // 同梱リソース側の refresh クリーンアップ
    for res_target in &inspection.bundled_resources {
        if res_target.refresh && res_target.destination_dir.exists() {
            println!(
                "🧹 Performing refresh cleanup on bundled resource dir: {:?} (masks: {:?})",
                res_target.destination_dir, res_target.refresh_undelete_mask
            );
            perform_refresh_cleanup(
                &res_target.destination_dir,
                &res_target.refresh_undelete_mask,
            );
        }
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
