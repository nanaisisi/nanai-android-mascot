#![allow(unused_imports)]
use crate::common::*;
use crate::ghost::scan::*;
use crate::shiori::dynamic::ShioriDynamicEngine;

use nanai_android_mascot_ui::{open_shift_jis_file, resolve_vfs_path};
use std::path::{Path, PathBuf};
use std::sync::Mutex;
#[cfg(desktop)]
use tauri::menu::{MenuBuilder, SubmenuBuilder};
use tauri::{Emitter, Manager};
/// ゴーストを読み込み（動的SHIORIローダー対応）
#[tauri::command]
pub async fn load_ghost(
    state: tauri::State<'_, AppState>,
    ghost_name: String,
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    println!("📥 Loading ghost: {}", ghost_name);

    // 既存のSHIORIをアンロード
    if let Ok(mut engine_lock) = state.shiori_engine.lock()
        && let Some(mut engine) = engine_lock.take()
    {
        let _ = engine.unload();
    }

    if let Ok(mut ghost_lock) = state.current_ghost_name.lock() {
        *ghost_lock = Some(ghost_name.clone());
    }

    // ゴーストディレクトリの解決 (assets/ghost/名 または ghost/名)
    let candidate_dirs = vec![
        format!("assets/ghost/{}", ghost_name),
        format!("ghost/{}", ghost_name),
    ];

    let mut ghost_dir = PathBuf::from(format!("assets/ghost/{}", ghost_name));
    for rel in candidate_dirs {
        if let Ok(resolved) = resolve_asset_path(&rel, &app_handle)
            && resolved.exists()
        {
            ghost_dir = resolved;
            break;
        }
    }

    let ghost_master_dir = ghost_dir.join("ghost").join("master");

    // SHIORIライブラリ（DLL / .so）の探索候補
    let mut candidates = Vec::new();
    #[cfg(windows)]
    {
        candidates.push(ghost_master_dir.join("yaya.dll"));
        candidates.push(ghost_master_dir.join("shiori.dll"));
        candidates.push(ghost_master_dir.join("satoriya.dll"));
    }
    #[cfg(not(windows))]
    {
        candidates.push(ghost_master_dir.join("yaya.so"));
        candidates.push(ghost_master_dir.join("shiori.so"));
        candidates.push(ghost_master_dir.join("libyaya.so"));
    }

    let mut loaded = false;
    for cand in candidates {
        if cand.exists() {
            println!("🔍 Attempting to load SHIORI binary: {:?}", cand);
            match ShioriDynamicEngine::load_library(&cand) {
                Ok(mut engine) => {
                    if let Err(e) = engine.initialize(&ghost_master_dir) {
                        eprintln!("⚠️ Failed to initialize SHIORI at {:?}: {}", cand, e);
                    } else {
                        if let Ok(mut engine_lock) = state.shiori_engine.lock() {
                            *engine_lock = Some(engine);
                        }
                        loaded = true;
                        println!("🎉 Native SHIORI activated: {:?}", cand);
                        break;
                    }
                }
                Err(e) => {
                    eprintln!("⚠️ Failed to load library {:?}: {}", cand, e);
                }
            }
        }
    }

    if loaded {
        Ok(format!("Ghost '{}' loaded with native SHIORI", ghost_name))
    } else {
        println!(
            "ℹ️ No native SHIORI library found or loaded; fallback mode enabled for '{}'",
            ghost_name
        );
        Ok(format!("Ghost '{}' loaded (fallback mode)", ghost_name))
    }
}

/// SHIORIにリクエストを送信（SHIORI/3.0 プロトコル準拠）
#[tauri::command]
pub async fn send_shiori_request(
    state: tauri::State<'_, AppState>,
    request: String,
) -> Result<String, String> {
    // ネイティブSHIORIエンジンへ委譲
    let engine_lock = state
        .shiori_engine
        .lock()
        .map_err(|e| format!("Failed to lock SHIORI engine: {}", e))?;

    if let Some(ref engine) = *engine_lock {
        engine.request(&request)
    } else {
        Err("No active SHIORI engine loaded".to_string())
    }
}

/// SHIORIにイベントを送信（簡易版・パラメータ指定対応）
#[tauri::command]
pub async fn send_shiori_event(
    state: tauri::State<'_, AppState>,
    event: String,
    references: Option<Vec<String>>,
) -> Result<String, String> {
    let mut req = format!(
        "GET SHIORI/3.0\r\nID: {}\r\nSender: NanaiMascot\r\nCharset: UTF-8\r\n",
        event
    );
    if let Some(refs) = references {
        for (i, ref_val) in refs.iter().enumerate() {
            req.push_str(&format!("Reference{}: {}\r\n", i, ref_val));
        }
    }
    req.push_str("\r\n");
    send_shiori_request(state, req).await
}

/// マウスクリックイベントを送信（簡易版）
#[tauri::command]
pub async fn on_mouse_click() -> Result<String, String> {
    println!("🖱️ Mouse click event");
    Ok("Mouse clicked".to_string())
}

/// 秒数変化イベントを送信（簡易版）
#[tauri::command]
pub async fn on_second_change() -> Result<String, String> {
    // 無音で実行
    Ok("Second changed".to_string())
}

/// 現在のゴースト情報を取得（簡易版）
#[tauri::command]
pub async fn get_current_ghost(
    _state: tauri::State<'_, AppState>,
) -> Result<Option<GhostInfo>, String> {
    // 実際にはゴーストが選択されていない場合はNoneを返す
    Ok(None)
}

/// すべてのゴースト情報を取得（簡易版）
#[tauri::command]
pub async fn get_all_ghosts(_state: tauri::State<'_, AppState>) -> Result<Vec<GhostInfo>, String> {
    // 実際のスキャン結果のみを返す（空の場合は空配列）
    Ok(vec![])
}

/// SHIORIの状態を取得
#[tauri::command]
pub async fn get_shiori_status(state: tauri::State<'_, AppState>) -> Result<bool, String> {
    if let Ok(lock) = state.shiori_engine.lock() {
        Ok(lock.is_some())
    } else {
        Ok(false)
    }
}

/// 現在のゴーストを終了
#[tauri::command]
pub async fn unload_current_ghost(state: tauri::State<'_, AppState>) -> Result<String, String> {
    if let Ok(mut engine_lock) = state.shiori_engine.lock()
        && let Some(mut engine) = engine_lock.take()
    {
        let _ = engine.unload();
    }
    if let Ok(mut ghost_lock) = state.current_ghost_name.lock() {
        *ghost_lock = None;
    }
    Ok("Ghost unloaded successfully".to_string())
}

/// 簡易ゴーストスキャン（JavaScriptから呼び出し用）
#[tauri::command]
pub async fn scan_ghosts(
    state: tauri::State<'_, AppState>,
    ghost_path: String,
    app_handle: tauri::AppHandle,
) -> Result<ScanResult, String> {
    // ghost_pathをghost_dirとしてscan_ghost_directoryに渡す
    scan_ghost_directory(state, ghost_path, app_handle).await
}
