#![allow(unused_imports)]
use crate::common::*;
use nanai_android_mascot_ui::{open_shift_jis_file, resolve_vfs_path};
use std::path::{Path, PathBuf};
use std::sync::Mutex;
#[cfg(desktop)]
use tauri::menu::{MenuBuilder, SubmenuBuilder};
use tauri::{Emitter, Manager};
// 設定読み込みコマンド（config.local.toml優先、フォールバックconfig.initial.toml）
#[tauri::command]
pub fn get_app_config(
    app_handle: tauri::AppHandle<tauri::Wry>,
) -> Result<serde_json::Value, String> {
    use std::fs;

    let initial_path = resolve_asset_path("config.initial.toml", &app_handle)
        .unwrap_or_else(|_| PathBuf::from("config.initial.toml"));
    let local_path = resolve_asset_path("config.local.toml", &app_handle)
        .unwrap_or_else(|_| PathBuf::from("config.local.toml"));

    // config.initial.toml のパース
    let mut config_value: toml::Value = if initial_path.exists() {
        let content = fs::read_to_string(&initial_path)
            .map_err(|e| format!("Failed to read initial config: {}", e))?;
        toml::from_str(&content).unwrap_or(toml::Value::Table(toml::map::Map::new()))
    } else {
        toml::Value::Table(toml::map::Map::new())
    };

    // config.local.toml が存在しない場合は初期設定から自動複製生成
    if !local_path.exists()
        && initial_path.exists()
        && let Ok(content) = fs::read_to_string(&initial_path)
    {
        let _ = fs::write(&local_path, content);
        println!("📄 Initialized config.local.toml from config.initial.toml");
    }

    // config.local.toml の読み込みとマージ
    if local_path.exists()
        && let Ok(local_str) = fs::read_to_string(&local_path)
        && let Ok(toml::Value::Table(local_map)) = toml::from_str::<toml::Value>(&local_str)
        && let toml::Value::Table(ref mut base_map) = config_value
    {
        for (k, v) in local_map {
            match (base_map.get_mut(&k), v) {
                (Some(toml::Value::Table(target_sub)), toml::Value::Table(source_sub)) => {
                    for (sub_k, sub_v) in source_sub {
                        target_sub.insert(sub_k, sub_v);
                    }
                }
                (_, other) => {
                    base_map.insert(k, other);
                }
            }
        }
    }

    // toml::Value -> serde_json::Value へ変換
    let json_val = serde_json::to_value(config_value)
        .map_err(|e| format!("Failed to convert TOML config to JSON: {}", e))?;

    Ok(json_val)
}

// ゴースト読み込み順序・前回ゴーストを config.local.toml に記録
#[tauri::command]
pub fn record_ghost_loaded(
    ghost_name: String,
    app_handle: tauri::AppHandle<tauri::Wry>,
) -> Result<(), String> {
    use std::fs;

    let initial_path = resolve_asset_path("config.initial.toml", &app_handle)
        .unwrap_or_else(|_| PathBuf::from("config.initial.toml"));
    let local_path = resolve_asset_path("config.local.toml", &app_handle)
        .unwrap_or_else(|_| PathBuf::from("config.local.toml"));

    // ファイルが存在しなければ初期ファイルから作成
    if !local_path.exists()
        && initial_path.exists()
        && let Ok(content) = fs::read_to_string(&initial_path)
    {
        let _ = fs::write(&local_path, content);
    }

    let content = if local_path.exists() {
        fs::read_to_string(&local_path).unwrap_or_default()
    } else {
        String::new()
    };

    let mut toml_val: toml::Value =
        toml::from_str(&content).unwrap_or_else(|_| toml::Value::Table(toml::map::Map::new()));

    if let toml::Value::Table(ref mut root) = toml_val {
        let state_val = root
            .entry("state".to_string())
            .or_insert_with(|| toml::Value::Table(toml::map::Map::new()));

        if let toml::Value::Table(state_table) = state_val {
            // last_ghost を更新
            state_table.insert(
                "last_ghost".to_string(),
                toml::Value::String(ghost_name.clone()),
            );

            // last_ghosts のリストを更新（先頭に追加し重複排除）
            let mut list: Vec<String> =
                if let Some(toml::Value::Array(arr)) = state_table.get("last_ghosts") {
                    arr.iter()
                        .filter_map(|v| v.as_str().map(|s| s.to_string()))
                        .collect()
                } else {
                    Vec::new()
                };

            list.retain(|name| name != &ghost_name);
            list.insert(0, ghost_name);
            list.truncate(20); // 直近20件

            let toml_arr = list.into_iter().map(toml::Value::String).collect();
            state_table.insert("last_ghosts".to_string(), toml::Value::Array(toml_arr));
        }
    }

    if let Ok(serialized) = toml::to_string_pretty(&toml_val) {
        fs::write(&local_path, serialized)
            .map_err(|e| format!("Failed to save config.local.toml: {}", e))?;
    }

    Ok(())
}
