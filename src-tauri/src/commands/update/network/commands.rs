//! ゴーストネットワーク更新（チェック・ダウンロード・書き込み実行）コマンドモジュール

use super::helpers::{report_progress, resolve_update_ghost_dir, validate_update_path};
use crate::commands::update::dau::*;
use md5::{Digest, Md5};
use std::fs;

/// ゴーストの更新チェック
#[tauri::command]
pub async fn check_ghost_update(
    state: tauri::State<'_, crate::common::state::AppState>,
    app_handle: tauri::AppHandle,
    ghost_name: Option<String>,
    ghost_path: Option<String>,
) -> Result<UpdateCheckResult, String> {
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

    let homeurl = get_ghost_homeurl(&ghost_dir).ok_or_else(|| {
        format!(
            "ゴースト「{}」に homeurl が設定されていません",
            target_ghost
        )
    })?;

    let client = reqwest::Client::builder()
        .user_agent("NanaiAndroidMascot/1.0 (SSP Compatible)")
        .timeout(std::time::Duration::from_secs(15))
        .build()
        .map_err(|e| e.to_string())?;

    // updates2.dau を試行、無ければ updates.txt を試行
    let mut update_content = None;
    let url_dau = format!("{}updates2.dau", homeurl);
    if let Ok(resp) = client.get(&url_dau).send().await
        && resp.status().is_success()
        && let Ok(bytes) = resp.bytes().await
    {
        let (decoded, _, _) = encoding_rs::SHIFT_JIS.decode(&bytes);
        update_content = Some(decoded.to_string());
    }

    if update_content.is_none() {
        let url_txt = format!("{}updates.txt", homeurl);
        if let Ok(resp) = client.get(&url_txt).send().await
            && resp.status().is_success()
            && let Ok(bytes) = resp.bytes().await
        {
            let (decoded, _, _) = encoding_rs::SHIFT_JIS.decode(&bytes);
            update_content = Some(decoded.to_string());
        }
    }

    let content = update_content.ok_or_else(|| {
        format!(
            "更新情報ファイル (updates2.dau / updates.txt) の取得に失敗しました ({})",
            homeurl
        )
    })?;

    let entries = parse_update_definition(&content);
    for entry in &entries {
        validate_update_path(&entry.path)?;
    }

    // 候補ファイルの存在確認およびMD5ハッシュ計算を tokio::task::JoinSet により非同期並列実行
    let mut join_set = tokio::task::JoinSet::new();
    for (index, entry) in entries.into_iter().enumerate() {
        let ghost_dir = ghost_dir.clone();
        join_set.spawn_blocking(move || {
            let local_file_path = ghost_dir.join(&entry.path);
            let mut needs_update = false;

            if !local_file_path.exists() {
                needs_update = true;
            } else if !entry.md5.is_empty() {
                if let Some(local_md5) = calculate_file_md5(&local_file_path) {
                    if local_md5 != entry.md5 {
                        needs_update = true;
                    }
                } else {
                    needs_update = true;
                }
            }

            (index, entry, needs_update)
        });
    }

    let mut indexed_diff = Vec::new();
    while let Some(res) = join_set.join_next().await {
        if let Ok((index, entry, needs_update)) = res
            && needs_update {
                indexed_diff.push((index, entry));
            }
    }

    // updates2.dau 元の出現順を保持
    indexed_diff.sort_by_key(|(idx, _)| *idx);
    let diff_files: Vec<_> = indexed_diff.into_iter().map(|(_, entry)| entry).collect();

    let has_update = !diff_files.is_empty();
    let total_count = diff_files.len();
    let message = if has_update {
        format!("更新対象ファイルが {} 件見つかりました", total_count)
    } else {
        "最新の状態です。更新ファイルはありません".to_string()
    };

    Ok(UpdateCheckResult {
        has_update,
        homeurl,
        ghost_name: target_ghost,
        update_files: diff_files,
        total_count,
        message,
    })
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

    if !check_result.has_update {
        return Ok(UpdateExecutionResult {
            success: true,
            reason: "none".to_string(),
            updated_files: Vec::new(),
            ghost_name: check_result.ghost_name,
        });
    }

    let ghost_dir =
        resolve_update_ghost_dir(&check_result.ghost_name, ghost_path.as_deref(), &app_handle);

    let client = reqwest::Client::builder()
        .user_agent("NanaiAndroidMascot/1.0 (SSP Compatible)")
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| e.to_string())?;

    let mut updated_files = Vec::new();

    for entry in check_result.update_files {
        validate_update_path(&entry.path)?;
        let file_url = format!("{}{}", check_result.homeurl, entry.path.replace('\\', "/"));
        println!("⬇️ Downloading update file: {}", file_url);
        report_progress(&app_handle, "download-begin", &entry.path, None);

        let resp = match client.get(&file_url).send().await {
            Ok(r) => {
                if !r.status().is_success() {
                    let status = r.status().as_u16().to_string();
                    report_progress(&app_handle, "download-failed", &entry.path, Some(&status));
                    return Ok(UpdateExecutionResult {
                        success: false,
                        reason: status,
                        updated_files,
                        ghost_name: check_result.ghost_name,
                    });
                }
                r
            }
            Err(e) => {
                let reason = if e.is_timeout() { "timeout" } else { "404" };
                report_progress(&app_handle, "download-failed", &entry.path, Some(reason));
                return Ok(UpdateExecutionResult {
                    success: false,
                    reason: reason.to_string(),
                    updated_files,
                    ghost_name: check_result.ghost_name,
                });
            }
        };

        let bytes = resp.bytes().await.map_err(|e| e.to_string())?;

        // MD5 チェック
        if !entry.md5.is_empty() {
            report_progress(&app_handle, "md5-begin", &entry.path, None);
            let mut hasher = Md5::new();
            hasher.update(&bytes);
            let downloaded_md5: String = hasher
                .finalize()
                .iter()
                .map(|b| format!("{:02x}", b))
                .collect();
            if downloaded_md5 != entry.md5 {
                println!(
                    "❌ MD5 mismatch for {}: expected {}, got {}",
                    entry.path, entry.md5, downloaded_md5
                );
                report_progress(&app_handle, "md5-failed", &entry.path, Some("md5 miss"));
                return Ok(UpdateExecutionResult {
                    success: false,
                    reason: "md5 miss".to_string(),
                    updated_files,
                    ghost_name: check_result.ghost_name,
                });
            }
            report_progress(&app_handle, "md5-complete", &entry.path, None);
        }

        // 保存
        let local_path = ghost_dir.join(&entry.path);
        if let Some(parent) = local_path.parent() {
            let _ = fs::create_dir_all(parent);
        }

        if let Err(e) = fs::write(&local_path, &bytes) {
            println!("❌ File write error: {}", e);
            report_progress(&app_handle, "fileio-failed", &entry.path, None);
            return Ok(UpdateExecutionResult {
                success: false,
                reason: "fileio".to_string(),
                updated_files,
                ghost_name: check_result.ghost_name,
            });
        }

        report_progress(&app_handle, "saved", &entry.path, None);
        updated_files.push(entry.path);
    }

    // 更新後に delete.txt が存在する場合、旧ファイルのクリーンアップ処理を実行
    crate::commands::install::archive::process_delete_txt(&ghost_dir);

    Ok(UpdateExecutionResult {
        success: true,
        reason: "changed".to_string(),
        updated_files,
        ghost_name: check_result.ghost_name,
    })
}
