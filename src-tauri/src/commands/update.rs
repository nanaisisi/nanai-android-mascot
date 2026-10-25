use std::fs;
use std::path::{Path, PathBuf};
use md5::{Md5, Digest};
use nanai_android_mascot_ui::{Descript, open_text_file};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct UpdateEntry {
    pub path: String,
    pub md5: String,
    pub size: Option<u64>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct UpdateCheckResult {
    pub has_update: bool,
    pub homeurl: String,
    pub ghost_name: String,
    pub update_files: Vec<UpdateEntry>,
    pub total_count: usize,
    pub message: String,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct UpdateExecutionResult {
    pub success: bool,
    pub reason: String, // "changed", "none", "timeout", "md5 miss", "404", "fileio", etc.
    pub updated_files: Vec<String>,
    pub ghost_name: String,
}

/// updates2.dau または updates.txt の内容をパース
pub fn parse_update_definition(content: &str) -> Vec<UpdateEntry> {
    let mut entries = Vec::new();
    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }

        // updates.txt の場合: "file," プレフィックス
        let data_part = if let Some(stripped) = trimmed.strip_prefix("file,") {
            stripped
        } else if trimmed.starts_with("charset,") {
            continue;
        } else {
            trimmed
        };

        // 区切り文字: \x01 (Byte 1) または カンマフォールバック
        let parts: Vec<&str> = if data_part.contains('\x01') {
            data_part.split('\x01').collect()
        } else {
            data_part.split(',').collect()
        };

        if parts.is_empty() {
            continue;
        }

        let rel_path = parts[0].trim().replace('\\', "/");
        if rel_path.is_empty() {
            continue;
        }

        let md5_hash = if parts.len() > 1 {
            parts[1].trim().to_lowercase()
        } else {
            String::new()
        };

        let mut size = None;
        for &extra in parts.iter().skip(2) {
            let extra_trimmed = extra.trim();
            if let Some(s) = extra_trimmed.strip_prefix("size=") {
                if let Ok(val) = s.parse::<u64>() {
                    size = Some(val);
                }
            }
        }

        entries.push(UpdateEntry {
            path: rel_path,
            md5: md5_hash,
            size,
        });
    }
    entries
}

/// ローカルファイルの MD5 ハッシュを計算
pub fn calculate_file_md5(path: &Path) -> Option<String> {
    if !path.exists() || !path.is_file() {
        return None;
    }
    let data = fs::read(path).ok()?;
    let mut hasher = Md5::new();
    hasher.update(&data);
    let hash = hasher.finalize();
    let hex_str: String = hash.iter().map(|b| format!("{:02x}", b)).collect();
    Some(hex_str)
}

/// ゴーストの homeurl を取得
pub fn get_ghost_homeurl(ghost_dir: &Path) -> Option<String> {
    // 1. ghost/master/descript.txt
    let master_desc = ghost_dir.join("ghost").join("master").join("descript.txt");
    if let Ok(content) = open_text_file(&master_desc) {
        let desc = Descript::parse(&content);
        if let Some(url) = desc.homeurl() {
            let mut u = url.trim().to_string();
            if !u.ends_with('/') {
                u.push('/');
            }
            return Some(u);
        }
    }

    // 2. ルートの descript.txt
    let root_desc = ghost_dir.join("descript.txt");
    if let Ok(content) = open_text_file(&root_desc) {
        let desc = Descript::parse(&content);
        if let Some(url) = desc.homeurl() {
            let mut u = url.trim().to_string();
            if !u.ends_with('/') {
                u.push('/');
            }
            return Some(u);
        }
    }

    None
}

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
            .map_err(|e| e.to_string())?
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

    let homeurl = get_ghost_homeurl(&ghost_dir)
        .ok_or_else(|| format!("ゴースト「{}」に homeurl が設定されていません", target_ghost))?;

    let client = reqwest::Client::builder()
        .user_agent("NanaiAndroidMascot/1.0 (SSP Compatible)")
        .timeout(std::time::Duration::from_secs(15))
        .build()
        .map_err(|e| e.to_string())?;

    // updates2.dau を試行、無ければ updates.txt を試行
    let mut update_content = None;
    let url_dau = format!("{}updates2.dau", homeurl);
    if let Ok(resp) = client.get(&url_dau).send().await {
        if resp.status().is_success() {
            if let Ok(bytes) = resp.bytes().await {
                let (decoded, _, _) = encoding_rs::SHIFT_JIS.decode(&bytes);
                update_content = Some(decoded.to_string());
            }
        }
    }

    if update_content.is_none() {
        let url_txt = format!("{}updates.txt", homeurl);
        if let Ok(resp) = client.get(&url_txt).send().await {
            if resp.status().is_success() {
                if let Ok(bytes) = resp.bytes().await {
                    let (decoded, _, _) = encoding_rs::SHIFT_JIS.decode(&bytes);
                    update_content = Some(decoded.to_string());
                }
            }
        }
    }

    let content = update_content
        .ok_or_else(|| format!("更新情報ファイル (updates2.dau / updates.txt) の取得に失敗しました ({})", homeurl))?;

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
    let check_result = check_ghost_update(state.clone(), app_handle.clone(), ghost_name.clone()).await?;

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
            let downloaded_md5: String = hasher.finalize().iter().map(|b| format!("{:02x}", b)).collect();
            if downloaded_md5 != entry.md5 {
                println!("❌ MD5 mismatch for {}: expected {}, got {}", entry.path, entry.md5, downloaded_md5);
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

