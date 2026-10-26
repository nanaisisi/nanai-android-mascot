use super::dau::*;
use md5::{Digest, Md5};
use std::fs;
use std::path::PathBuf;

/// ゴーストの更新チェック
#[tauri::command]
pub async fn check_ghost_update(
    state: tauri::State<'_, crate::common::AppState>,
    app_handle: tauri::AppHandle,
    ghost_name: Option<String>,
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

    let candidate_dirs = vec![
        format!("assets/ghost/{}", target_ghost),
        format!("ghost/{}", target_ghost),
    ];

    let mut ghost_dir = PathBuf::from(format!("assets/ghost/{}", target_ghost));
    for rel in candidate_dirs {
        if let Ok(resolved) = crate::common::resolve_asset_path(&rel, &app_handle)
            && resolved.exists()
        {
            ghost_dir = resolved;
            break;
        }
    }

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
    let mut diff_files = Vec::new();

    for entry in entries {
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

        if needs_update {
            diff_files.push(entry);
        }
    }

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
    state: tauri::State<'_, crate::common::AppState>,
    app_handle: tauri::AppHandle,
    ghost_name: Option<String>,
) -> Result<UpdateExecutionResult, String> {
    let check_result =
        check_ghost_update(state.clone(), app_handle.clone(), ghost_name.clone()).await?;

    if !check_result.has_update {
        return Ok(UpdateExecutionResult {
            success: true,
            reason: "none".to_string(),
            updated_files: Vec::new(),
            ghost_name: check_result.ghost_name,
        });
    }

    let candidate_dirs = vec![
        format!("assets/ghost/{}", check_result.ghost_name),
        format!("ghost/{}", check_result.ghost_name),
    ];

    let mut ghost_dir = PathBuf::from(format!("assets/ghost/{}", check_result.ghost_name));
    for rel in candidate_dirs {
        if let Ok(resolved) = crate::common::resolve_asset_path(&rel, &app_handle)
            && resolved.exists()
        {
            ghost_dir = resolved;
            break;
        }
    }

    let client = reqwest::Client::builder()
        .user_agent("NanaiAndroidMascot/1.0 (SSP Compatible)")
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| e.to_string())?;

    let mut updated_files = Vec::new();

    for entry in check_result.update_files {
        let file_url = format!("{}{}", check_result.homeurl, entry.path);
        println!("⬇️ Downloading update file: {}", file_url);

        let resp = match client.get(&file_url).send().await {
            Ok(r) => {
                if !r.status().is_success() {
                    return Ok(UpdateExecutionResult {
                        success: false,
                        reason: r.status().as_u16().to_string(),
                        updated_files,
                        ghost_name: check_result.ghost_name,
                    });
                }
                r
            }
            Err(e) => {
                let reason = if e.is_timeout() { "timeout" } else { "404" };
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
                return Ok(UpdateExecutionResult {
                    success: false,
                    reason: "md5 miss".to_string(),
                    updated_files,
                    ghost_name: check_result.ghost_name,
                });
            }
        }

        // 保存
        let local_path = ghost_dir.join(&entry.path);
        if let Some(parent) = local_path.parent() {
            let _ = fs::create_dir_all(parent);
        }

        if let Err(e) = fs::write(&local_path, &bytes) {
            println!("❌ File write error: {}", e);
            return Ok(UpdateExecutionResult {
                success: false,
                reason: "fileio".to_string(),
                updated_files,
                ghost_name: check_result.ghost_name,
            });
        }

        updated_files.push(entry.path);
    }

    Ok(UpdateExecutionResult {
        success: true,
        reason: "changed".to_string(),
        updated_files,
        ghost_name: check_result.ghost_name,
    })
}
