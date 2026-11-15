//! ゴーストネットワーク更新実行コマンド

use super::check::check_ghost_update;
use super::super::helpers::{
    ReportProgressParams, report_progress, resolve_update_ghost_dir, validate_update_path,
};
use crate::commands::update::dau::*;
use md5::{Digest, Md5};
use std::fs;

/// ゴーストのネットワーク更新を実行
#[tauri::command]
pub async fn execute_ghost_update(
    state: tauri::State<'_, crate::common::state::AppState>,
    app_handle: tauri::AppHandle,
    ghost_name: Option<String>,
    ghost_path: Option<String>,
) -> Result<UpdateExecutionResult, String> {
    let check_result = check_ghost_update(
        state.clone(),
        app_handle.clone(),
        ghost_name.clone(),
        ghost_path.clone(),
    )
    .await?;

    if !check_result.has_update() {
        return Ok(UpdateExecutionResult::new(
            true,
            "none".to_string(),
            Vec::new(),
            check_result.ghost_name().to_string(),
        ));
    }

    let ghost_dir = resolve_update_ghost_dir(
        check_result.ghost_name(),
        ghost_path.as_deref(),
        &app_handle,
    );

    let client = reqwest::Client::builder()
        .user_agent("NanaiAndroidMascot/1.0 (SSP Compatible)")
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| e.to_string())?;

    let mut updated_files = Vec::new();

    for entry in check_result.update_files() {
        validate_update_path(entry.path())?;
        let file_url = format!(
            "{}{}",
            check_result.homeurl(),
            entry.path().replace('\\', "/")
        );
        println!("⬇️ Downloading update file: {}", file_url);
        report_progress(
            &app_handle,
            ReportProgressParams::new("download-begin", entry.path(), None),
        );

        let resp = match client.get(&file_url).send().await {
            Ok(r) => {
                if !r.status().is_success() {
                    let status = r.status().as_u16().to_string();
                    report_progress(
                        &app_handle,
                        ReportProgressParams::new("download-failed", entry.path(), Some(&status)),
                    );
                    return Ok(UpdateExecutionResult::new(
                        false,
                        status,
                        updated_files,
                        check_result.ghost_name().to_string(),
                    ));
                }
                r
            }
            Err(e) => {
                let reason = if e.is_timeout() { "timeout" } else { "404" };
                report_progress(
                    &app_handle,
                    ReportProgressParams::new("download-failed", entry.path(), Some(reason)),
                );
                return Ok(UpdateExecutionResult::new(
                    false,
                    reason.to_string(),
                    updated_files,
                    check_result.ghost_name().to_string(),
                ));
            }
        };

        let bytes = resp.bytes().await.map_err(|e| e.to_string())?;

        // MD5 チェック
        if !entry.md5().is_empty() {
            report_progress(
                &app_handle,
                ReportProgressParams::new("md5-begin", entry.path(), None),
            );
            let mut hasher = Md5::new();
            hasher.update(&bytes);
            let downloaded_md5: String = hasher
                .finalize()
                .iter()
                .map(|b| format!("{:02x}", b))
                .collect();
            if downloaded_md5 != entry.md5() {
                println!(
                    "❌ MD5 mismatch for {}: expected {}, got {}",
                    entry.path(),
                    entry.md5(),
                    downloaded_md5
                );
                report_progress(
                    &app_handle,
                    ReportProgressParams::new("md5-failed", entry.path(), Some("md5 miss")),
                );
                return Ok(UpdateExecutionResult::new(
                    false,
                    "md5 miss".to_string(),
                    updated_files,
                    check_result.ghost_name().to_string(),
                ));
            }
            report_progress(
                &app_handle,
                ReportProgressParams::new("md5-complete", entry.path(), None),
            );
        }

        // 保存
        let local_path = ghost_dir.join(entry.path());
        if let Some(parent) = local_path.parent() {
            let _ = fs::create_dir_all(parent);
        }

        if let Err(e) = fs::write(&local_path, &bytes) {
            println!("❌ File write error: {}", e);
            report_progress(
                &app_handle,
                ReportProgressParams::new("fileio-failed", entry.path(), None),
            );
            return Ok(UpdateExecutionResult::new(
                false,
                "fileio".to_string(),
                updated_files,
                check_result.ghost_name().to_string(),
            ));
        }

        report_progress(
            &app_handle,
            ReportProgressParams::new("saved", entry.path(), None),
        );
        updated_files.push(entry.path().to_string());
    }

    // 更新後に delete.txt が存在する場合、旧ファイルのクリーンアップ処理を実行
    crate::commands::install::archive::process_delete_txt(&ghost_dir);

    Ok(UpdateExecutionResult::new(
        true,
        "changed".to_string(),
        updated_files,
        check_result.ghost_name().to_string(),
    ))
}
