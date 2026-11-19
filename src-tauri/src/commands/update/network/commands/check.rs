//! ゴーストネットワーク更新チェックコマンド

use super::super::helpers::{
    is_noupdate_excluded, read_noupdate_patterns, resolve_update_ghost_dir, validate_update_path,
};
use crate::commands::update::dau::*;

pub(super) async fn check_dir_update(
    target_dir: &std::path::Path,
    target_name: &str,
    homeurl: Option<String>,
    missing_homeurl_msg: String,
) -> Result<UpdateCheckResult, String> {
    let homeurl = match homeurl {
        Some(url) => url,
        None => {
            return Ok(UpdateCheckResult::new(
                false,
                "".to_string(),
                target_name.to_string(),
                vec![],
                0,
                missing_homeurl_msg,
            ));
        }
    };

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

    let noupdate_patterns = read_noupdate_patterns(target_dir);
    let entries: Vec<_> = parse_update_definition(&content)
        .into_iter()
        .filter(|entry| !is_noupdate_excluded(entry.path(), &noupdate_patterns))
        .collect();
    for entry in &entries {
        validate_update_path(entry.path())?;
    }

    // 候補ファイルの存在確認およびMD5ハッシュ計算を tokio::task::JoinSet により非同期並列実行
    let mut join_set = tokio::task::JoinSet::new();
    for (index, entry) in entries.into_iter().enumerate() {
        let target_dir = target_dir.to_path_buf();
        join_set.spawn_blocking(move || {
            let local_file_path = target_dir.join(entry.path());
            let mut needs_update = false;

            if !local_file_path.exists() {
                needs_update = true;
            } else if !entry.md5().is_empty() {
                if let Some(local_md5) = calculate_file_md5(&local_file_path) {
                    if local_md5 != entry.md5() {
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
            && needs_update
        {
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

    Ok(UpdateCheckResult::new(
        has_update,
        homeurl,
        target_name.to_string(),
        diff_files,
        total_count,
        message,
    ))
}

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
    let homeurl = get_ghost_homeurl(&ghost_dir);
    let missing_msg = format!(
        "ゴースト「{}」に homeurl が設定されていません",
        target_ghost
    );

    check_dir_update(&ghost_dir, &target_ghost, homeurl, missing_msg).await
}
