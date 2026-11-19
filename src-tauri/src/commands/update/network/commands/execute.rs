//! ゴーストネットワーク更新実行コマンド

use super::super::helpers::{
    ReportProgressParams, read_dir_homeurl, report_progress, resolve_update_balloon_dir,
    resolve_update_ghost_dir, validate_update_path,
};
use super::check::{check_dir_update, check_ghost_update};
use crate::commands::update::dau::*;
use md5::{Digest, Md5};
use std::fs;
use std::path::Path;

async fn execute_dir_update(
    app_handle: &tauri::AppHandle,
    target_dir: &Path,
    check_result: UpdateCheckResult,
) -> Result<UpdateExecutionResult, String> {
    if !check_result.has_update() {
        return Ok(UpdateExecutionResult::new(
            true,
            "none".to_string(),
            Vec::new(),
            check_result.ghost_name().to_string(),
        ));
    }

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
            app_handle,
            ReportProgressParams::new("download-begin", entry.path(), None),
        );

        let resp = match client.get(&file_url).send().await {
            Ok(r) => {
                if !r.status().is_success() {
                    let status = r.status().as_u16().to_string();
                    report_progress(
                        app_handle,
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
                    app_handle,
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
                app_handle,
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
                    app_handle,
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
                app_handle,
                ReportProgressParams::new("md5-complete", entry.path(), None),
            );
        }

        // 保存
        let local_path = target_dir.join(entry.path());
        if let Some(parent) = local_path.parent() {
            let _ = fs::create_dir_all(parent);
        }

        if let Err(e) = fs::write(&local_path, &bytes) {
            println!("❌ File write error: {}", e);
            report_progress(
                app_handle,
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
            app_handle,
            ReportProgressParams::new("saved", entry.path(), None),
        );
        updated_files.push(entry.path().to_string());
    }

    // 更新後に delete.txt / delete1.txt が存在する場合、旧ファイルのクリーンアップ処理を実行
    crate::commands::install::archive::process_delete_txt(target_dir);

    Ok(UpdateExecutionResult::new(
        true,
        "changed".to_string(),
        updated_files,
        check_result.ghost_name().to_string(),
    ))
}

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

    let ghost_dir = resolve_update_ghost_dir(
        check_result.ghost_name(),
        ghost_path.as_deref(),
        &app_handle,
    );

    execute_dir_update(&app_handle, &ghost_dir, check_result).await
}

/// 追加シェルのネットワーク更新を実行
#[tauri::command]
pub async fn update_shell(
    state: tauri::State<'_, crate::common::state::AppState>,
    app_handle: tauri::AppHandle,
    shell_name: String,
    ghost_name: Option<String>,
    ghost_path: Option<String>,
) -> Result<UpdateExecutionResult, String> {
    let target_ghost = if let Some(name) = ghost_name {
        name
    } else {
        state
            .current_ghost_name
            .lock()
            .clone()
            .unwrap_or_else(|| "とらふぃっく☆とれいん".to_string())
    };

    let ghost_dir = resolve_update_ghost_dir(&target_ghost, ghost_path.as_deref(), &app_handle);
    let shell_dir = ghost_dir.join("shell").join(&shell_name);
    let homeurl = read_dir_homeurl(&shell_dir);
    let missing_msg = format!("シェル「{}」に homeurl が設定されていません", shell_name);

    let check_result = check_dir_update(&shell_dir, &shell_name, homeurl, missing_msg).await?;
    execute_dir_update(&app_handle, &shell_dir, check_result).await
}

/// バルーンのネットワーク更新を実行
#[tauri::command]
pub async fn update_balloon(
    app_handle: tauri::AppHandle,
    balloon_name: Option<String>,
    balloon_path: Option<String>,
) -> Result<UpdateExecutionResult, String> {
    let target_name = balloon_name
        .as_deref()
        .map(str::trim)
        .filter(|n| !n.is_empty())
        .unwrap_or("default")
        .to_string();

    let balloon_dir = resolve_update_balloon_dir(
        balloon_name.as_deref(),
        balloon_path.as_deref(),
        &app_handle,
    );
    let homeurl = read_dir_homeurl(&balloon_dir);
    let missing_msg = format!("バルーン「{}」に homeurl が設定されていません", target_name);

    let check_result = check_dir_update(&balloon_dir, &target_name, homeurl, missing_msg).await?;
    execute_dir_update(&app_handle, &balloon_dir, check_result).await
}
