use crate::common::*;
use crate::shiori::dynamic::ShioriDynamicEngine;
use std::path::PathBuf;

/// ゴーストを読み込み（動的SHIORIローダー対応）
#[tauri::command]
pub async fn load_ghost(
    state: tauri::State<'_, AppState>,
    ghost_name: String,
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    println!("📥 Loading ghost: {}", ghost_name);

    // 既存のSHIORIをアンロード
    if let Some(mut engine) = state.shiori_engine.lock().take() {
        let _ = engine.unload();
    }

    *state.current_ghost_name.lock() = Some(ghost_name.clone());

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
                        *state.shiori_engine.lock() = Some(engine);
                        state.active_ghosts.lock().insert("main".to_string(), ghost_name.clone());
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

/// ゴーストを新規インスタンスとして追加起動 (マルチゴースト)
#[tauri::command]
pub async fn spawn_ghost(
    state: tauri::State<'_, AppState>,
    ghost_name: String,
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    println!("👥 Spawning new ghost instance: {}", ghost_name);
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis();
    let instance_id = format!("ghost_{}", now);

    // ゴーストディレクトリの解決
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

    // SHIORI候補探索
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

    for cand in candidates {
        if cand.exists()
            && let Ok(mut engine) = ShioriDynamicEngine::load_library(&cand)
            && engine.initialize(&ghost_master_dir).is_ok()
        {
            state.ghost_engines.lock().insert(instance_id.clone(), engine);
            break;
        }
    }

    state.active_ghosts.lock().insert(instance_id.clone(), ghost_name.clone());

    #[cfg(desktop)]
    {
        // 新規ウィンドウを生成
        let encoded_name: String = ghost_name
            .bytes()
            .map(|b| {
                if b.is_ascii_alphanumeric() || b == b'-' || b == b'_' || b == b'.' || b == b'~' {
                    (b as char).to_string()
                } else {
                    format!("%{:02X}", b)
                }
            })
            .collect();
        let url = format!(
            "index.html?ghost_id={}&ghost_name={}",
            instance_id, encoded_name
        );
        let win_label = format!("window_{}", instance_id);

        let builder = tauri::WebviewWindowBuilder::new(
            &app_handle,
            &win_label,
            tauri::WebviewUrl::App(url.into()),
        )
        .title(format!("Nanai Android Mascot - {}", ghost_name))
        .inner_size(400.0, 600.0)
        .transparent(true)
        .decorations(false)
        .always_on_top(true)
        .resizable(true);

        builder.build().map_err(|e| e.to_string())?;
    }

    Ok(instance_id)
}

/// 単一ゴーストを終了 (SSP準拠: そのゴーストのみ終了。残りが無ければプロセス終了)
#[tauri::command]
pub async fn close_ghost(
    state: tauri::State<'_, AppState>,
    ghost_id: Option<String>,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    let target_id = ghost_id.unwrap_or_else(|| "main".to_string());
    println!("❌ Closing ghost instance: {}", target_id);

    // エンジン解放
    if let Some(mut engine) = state.ghost_engines.lock().remove(&target_id) {
        let _ = engine.unload();
    }
    if target_id == "main"
        && let Some(mut engine) = state.shiori_engine.lock().take()
    {
        let _ = engine.unload();
    }

    // アクティブゴーストから削除
    let mut active = state.active_ghosts.lock();
    active.remove(&target_id);
    let remaining_count = active.len();
    drop(active);

    #[cfg(desktop)]
    {
        use tauri::Manager;
        // 該当ウィンドウを閉じる
        let win_label = if target_id == "main" {
            "main".to_string()
        } else {
            format!("window_{}", target_id)
        };
        if let Some(win) = app_handle.get_webview_window(&win_label) {
            let _ = win.close();
        }
    }

    // 残りのゴーストがゼロになったらアプリ全体を終了
    if remaining_count == 0 {
        println!("🏁 No active ghosts remaining. Exiting app.");
        app_handle.exit(0);
    }

    Ok(())
}

/// 現在のゴーストを終了
#[tauri::command]
pub async fn unload_current_ghost(state: tauri::State<'_, AppState>) -> Result<String, String> {
    if let Some(mut engine) = state.shiori_engine.lock().take() {
        let _ = engine.unload();
    }
    *state.current_ghost_name.lock() = None;
    Ok("Ghost unloaded successfully".to_string())
}
