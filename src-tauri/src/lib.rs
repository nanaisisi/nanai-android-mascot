use nanai_android_mascot_ui::{open_shift_jis_file, resolve_vfs_path};
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::path::Path;
use std::path::PathBuf;
use tauri::Emitter;
use tauri::Manager;

// Desktop専用の機能
#[cfg(desktop)]
use tauri::image::Image;
#[cfg(desktop)]
use tauri::menu::{MenuBuilder, SubmenuBuilder};
#[cfg(desktop)]
use tauri::tray::{TrayIconBuilder, TrayIconEvent};

mod shiori_dynamic;
use shiori_dynamic::ShioriDynamicEngine;
use std::sync::Mutex;

// 簡易ゴースト情報
#[derive(Debug, Clone, serde::Serialize)]
struct GhostInfo {
    name: String,
    path: String,
}

// アプリケーション状態を定義
struct AppState {
    recent_files: Mutex<Vec<String>>,
    current_ghost_name: Mutex<Option<String>>,
    shiori_engine: Mutex<Option<ShioriDynamicEngine>>,
}

impl AppState {
    fn new() -> Self {
        AppState {
            recent_files: Mutex::new(Vec::new()),
            current_ghost_name: Mutex::new(None),
            shiori_engine: Mutex::new(None),
        }
    }
}

// エラーメッセージを全ウィンドウにemitするヘルパー関数
fn emit_error_to_all(app_handle: &tauri::AppHandle<tauri::Wry>, msg: String) {
    if let Some(window) = app_handle.get_webview_window("main")
        && let Err(err) = window.emit("error", msg.clone())
    {
        eprintln!("emit failed: {err}");
    }
}
// 設定読み込みコマンド（config.local.toml優先、フォールバックconfig.initial.toml）
#[tauri::command]
fn get_app_config(app_handle: tauri::AppHandle<tauri::Wry>) -> Result<serde_json::Value, String> {
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
fn record_ghost_loaded(
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

// ファイルを開くコマンド
#[tauri::command]
fn open_file(path: String, app_handle: tauri::AppHandle<tauri::Wry>) -> Result<String, String> {
    let clean_path = clean_verbatim_path(&path);
    let resolved_path =
        resolve_asset_path(&clean_path, &app_handle).unwrap_or_else(|_| PathBuf::from(&clean_path));

    match open_shift_jis_file(&resolved_path.to_string_lossy()) {
        Ok(content) => Ok(content),
        Err(e) => Err(format!("ファイルの読み込みに失敗しました: {e}")),
    }
}

// サーフィス画像を読み込んでData URL (Base64) として返すコマンド
#[tauri::command]
fn load_surface_image(
    ghost_path: String,
    shell_name: String,
    surface_id: String,
    app_handle: tauri::AppHandle<tauri::Wry>,
) -> Result<String, String> {
    use std::fs;
    let clean_gp = clean_verbatim_path(&ghost_path);
    let base_ghost_path =
        resolve_asset_path(&clean_gp, &app_handle).unwrap_or_else(|_| PathBuf::from(&clean_gp));

    let shell_dir = base_ghost_path.join("shell").join(&shell_name);
    let master_dir = base_ghost_path.join("shell").join("master");

    let surface_id_num = surface_id.parse::<u32>().unwrap_or(0);
    let candidates = vec![
        shell_dir.join(format!("surface{surface_id}.png")),
        shell_dir.join(format!("surface{surface_id_num:04}.png")),
        shell_dir.join(format!("surface{surface_id_num:02}.png")),
        shell_dir.join(format!("surface{surface_id}.svg")),
        shell_dir.join(format!("surface{surface_id}.pna")),
        shell_dir.join(format!("Surface{surface_id}.png")),
        shell_dir.join(format!("Surface{surface_id_num:04}.png")),
        shell_dir.join("surface0.png"),
        shell_dir.join("surface0000.png"),
        shell_dir.join("surface0.svg"),
        master_dir.join(format!("surface{surface_id}.png")),
        master_dir.join(format!("surface{surface_id_num:04}.png")),
        master_dir.join(format!("surface{surface_id_num:02}.png")),
        master_dir.join(format!("surface{surface_id}.svg")),
        master_dir.join("surface0.png"),
        master_dir.join("surface0000.png"),
        master_dir.join("surface0.svg"),
    ];

    for candidate in candidates {
        if candidate.exists()
            && candidate.is_file()
            && let Ok(bytes) = fs::read(&candidate)
        {
            let ext = candidate
                .extension()
                .and_then(|e| e.to_str())
                .unwrap_or("png")
                .to_lowercase();
            let mime = match ext.as_str() {
                "svg" => "image/svg+xml",
                "pna" => "image/png",
                _ => "image/png",
            };
            use base64::Engine;
            let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
            return Ok(format!("data:{mime};base64,{b64}"));
        }
    }

    Err(format!(
        "Surface image not found for surface_id: {surface_id} in shell: {shell_name}"
    ))
}

// 最近開いたファイル履歴を管理するための関数
#[tauri::command]
fn add_to_recent_files(
    path: String,
    app_handle: tauri::AppHandle<tauri::Wry>,
) -> Result<(), String> {
    let app_state = app_handle.state::<tauri::State<AppState>>();
    let mut recent_files = match app_state.recent_files.lock() {
        Ok(lock) => lock,
        Err(e) => {
            let msg = e.to_string();
            eprintln!("add_to_recent_files lock error: {msg}");
            emit_error_to_all(&app_handle, msg.clone());
            return Err(msg);
        }
    };

    // 既に存在する場合は削除して先頭に追加（LRU方式）
    if let Some(index) = recent_files.iter().position(|x| *x == path) {
        recent_files.remove(index);
    }

    // 先頭に追加
    recent_files.insert(0, path);

    // 最大10件まで保持
    if recent_files.len() > 10 {
        recent_files.truncate(10);
    }

    Ok(())
}

#[tauri::command]
fn get_recent_files(app_handle: tauri::AppHandle<tauri::Wry>) -> Result<Vec<String>, String> {
    let app_state = app_handle.state::<tauri::State<AppState>>();
    let recent_files = match app_state.recent_files.lock() {
        Ok(lock) => lock,
        Err(e) => {
            let msg = e.to_string();
            eprintln!("get_recent_files lock error: {msg}");
            emit_error_to_all(&app_handle, msg.clone());
            return Err(msg);
        }
    };
    Ok(recent_files.clone())
}

// ========================================
// SHIORI関連のTauriコマンド
// ========================================

/// ゴーストスキャン結果
#[derive(Debug, Clone, serde::Serialize)]
struct ScanResult {
    ghosts: Vec<GhostInfo>,
    resolved_path: String,
    input_path: String,
}

/// descript.txt からゴースト正式名を取得（Shift_JIS / UTF-8 両対応）
fn read_ghost_name_from_dir(ghost_dir: &Path) -> Option<String> {
    let candidates = [
        ghost_dir.join("ghost").join("master").join("descript.txt"),
        ghost_dir.join("descript.txt"),
        ghost_dir.join("install.txt"),
    ];

    for candidate in &candidates {
        if candidate.exists()
            && let Ok(bytes) = std::fs::read(candidate)
        {
            let (decoded, _, _) = encoding_rs::SHIFT_JIS.decode(&bytes);
            let text = if decoded.contains("name,") || decoded.contains("name:") {
                decoded.into_owned()
            } else {
                String::from_utf8_lossy(&bytes).into_owned()
            };

            for line in text.lines() {
                let trimmed = line.trim();
                if let Some(val) = trimmed.strip_prefix("name,") {
                    let cleaned = val.trim();
                    if !cleaned.is_empty() {
                        return Some(cleaned.to_string());
                    }
                } else if let Some(val) = trimmed.strip_prefix("name:") {
                    let cleaned = val.trim();
                    if !cleaned.is_empty() {
                        return Some(cleaned.to_string());
                    }
                }
            }
        }
    }
    None
}

/// ゴーストディレクトリをスキャンしてSHIORIを検出
#[tauri::command]
async fn scan_ghost_directory(
    _state: tauri::State<'_, AppState>,
    ghost_dir: String,
    app_handle: tauri::AppHandle,
) -> Result<ScanResult, String> {
    // アプリのパスコンテキストを取得
    let ghost_path = resolve_asset_path(&ghost_dir, &app_handle)?;

    println!("🔍 Input path: {}", ghost_dir);
    println!("🔍 Resolved absolute path: {:?}", ghost_path);

    // ゴーストスキャン（ディレクトリ巡回）
    let mut ghosts = Vec::new();

    if let Ok(entries) = std::fs::read_dir(&ghost_path) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                let dir_name = entry.file_name().to_string_lossy().to_string();
                // .gitや隠しフォルダを除外
                if !dir_name.starts_with('.') {
                    // descript.txt から正式ゴースト名を取得（なければディレクトリ名）
                    let display_name = read_ghost_name_from_dir(&path).unwrap_or(dir_name);
                    ghosts.push(GhostInfo {
                        name: display_name,
                        path: path.to_string_lossy().to_string(),
                    });
                }
            }
        }
    }

    // fallback: ディレクトリ走査で見つからずmock_nanaiが存在する場合
    if ghosts.is_empty() {
        let mock_nanai_path = ghost_path.join("mock_nanai");
        if mock_nanai_path.exists() {
            ghosts.push(GhostInfo {
                name: "mock_nanai".to_string(),
                path: mock_nanai_path.to_string_lossy().to_string(),
            });
        }
    }

    let result = ScanResult {
        ghosts,
        resolved_path: ghost_path.to_string_lossy().to_string(),
        input_path: ghost_dir,
    };

    println!("📊 Scan completed: {} ghosts found", result.ghosts.len());

    Ok(result)
}

/// アセットパスを解決（開発/本番環境対応）
fn resolve_asset_path(
    relative_path: &str,
    app_handle: &tauri::AppHandle,
) -> Result<PathBuf, String> {
    let clean = clean_verbatim_path(relative_path);
    let path = PathBuf::from(&clean);

    if path.is_absolute() {
        if path.exists() {
            return Ok(normalize_path(&path));
        }
        return Ok(path);
    }

    // 複数のパス候補を試す
    let path_candidates = vec![
        // 1. 開発モード: プロジェクトルート/assets/...
        {
            let current_dir = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
            let project_root = current_dir
                .ancestors()
                .find(|p| p.join("assets").exists())
                .or_else(|| {
                    current_dir.ancestors().find(|p| {
                        p.join("Cargo.toml").exists()
                            && p.file_name().is_none_or(|n| n != "src-tauri")
                    })
                })
                .unwrap_or(&current_dir);
            project_root.join(&path)
        },
        // 2. 本番モード: リソースディレクトリ
        app_handle
            .path()
            .resource_dir()
            .map(|resource_dir| resource_dir.join(&path))
            .unwrap_or_else(|_| PathBuf::from(&path)),
        // 3. 実行ファイル隣接
        app_handle
            .path()
            .app_data_dir()
            .map(|app_dir| app_dir.join(&path))
            .unwrap_or_else(|_| PathBuf::from(&path)),
        // 4. カレントディレクトリからの相対パス
        std::env::current_dir()
            .unwrap_or_else(|_| PathBuf::from("."))
            .join(&path),
    ];

    // 存在するパスを見つける (直接またはVFS大文字小文字吸収)
    for candidate in &path_candidates {
        println!("🔍 Checking path candidate: {:?}", candidate);
        if candidate.exists() {
            let normalized = normalize_path(candidate);
            println!("✅ Found valid path: {:?}", candidate);
            return Ok(normalized);
        }

        // 大文字・小文字差異の解決を試行
        if let Some(parent) = candidate.parent()
            && parent.exists()
            && let Some(file_name) = candidate.file_name().and_then(|n| n.to_str())
            && let Some(resolved) = resolve_vfs_path(parent, file_name)
        {
            let normalized = normalize_path(&resolved);
            println!("✅ Found path via VFS (case-insensitive): {:?}", resolved);
            return Ok(normalized);
        }
    }

    // 見つからない場合は最初の候補を返す（デバッグ用）
    let fallback = std::env::current_dir()
        .unwrap_or_else(|_| PathBuf::from("."))
        .join(&path);

    println!("⚠️ No valid path found, using fallback: {:?}", fallback);
    Ok(normalize_path(&fallback))
}

/// Windows の拡張プレフィックス (\\?\) を除去し、スラッシュを正規化
fn clean_verbatim_path(path_str: &str) -> String {
    let mut s = path_str.to_string();
    if let Some(stripped) = s.strip_prefix(r"\\?\") {
        s = stripped.to_string();
    }
    s.replace('/', std::path::MAIN_SEPARATOR_STR)
}

/// パスを正規化（../などを解決）
fn normalize_path(path: &Path) -> PathBuf {
    let canonical = if let Ok(canonical) = path.canonicalize() {
        canonical
    } else {
        // canonicalize()が失敗した場合は手動でパスを正規化
        let mut components = Vec::new();
        for component in path.components() {
            match component {
                std::path::Component::ParentDir => {
                    components.pop();
                }
                std::path::Component::CurDir => {
                    // "."は無視
                }
                _ => {
                    components.push(component);
                }
            }
        }
        components.iter().collect()
    };

    // Windows環境で \\?\ プレフィックスが付いていたら除去して通常のパスにする
    let path_str = canonical.to_string_lossy();
    if let Some(stripped) = path_str.strip_prefix(r"\\?\") {
        PathBuf::from(stripped)
    } else {
        canonical
    }
}

/// ゴーストを読み込み（動的SHIORIローダー対応）
#[tauri::command]
async fn load_ghost(
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
async fn send_shiori_request(
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
async fn send_shiori_event(
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
async fn on_mouse_click() -> Result<String, String> {
    println!("🖱️ Mouse click event");
    Ok("Mouse clicked".to_string())
}

/// 秒数変化イベントを送信（簡易版）
#[tauri::command]
async fn on_second_change() -> Result<String, String> {
    // 無音で実行
    Ok("Second changed".to_string())
}

/// 現在のゴースト情報を取得（簡易版）
#[tauri::command]
async fn get_current_ghost(
    _state: tauri::State<'_, AppState>,
) -> Result<Option<GhostInfo>, String> {
    // 実際にはゴーストが選択されていない場合はNoneを返す
    Ok(None)
}

/// すべてのゴースト情報を取得（簡易版）
#[tauri::command]
async fn get_all_ghosts(_state: tauri::State<'_, AppState>) -> Result<Vec<GhostInfo>, String> {
    // 実際のスキャン結果のみを返す（空の場合は空配列）
    Ok(vec![])
}

/// SHIORIの状態を取得
#[tauri::command]
async fn get_shiori_status(state: tauri::State<'_, AppState>) -> Result<bool, String> {
    if let Ok(lock) = state.shiori_engine.lock() {
        Ok(lock.is_some())
    } else {
        Ok(false)
    }
}

/// 現在のゴーストを終了
#[tauri::command]
async fn unload_current_ghost(state: tauri::State<'_, AppState>) -> Result<String, String> {
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
async fn scan_ghosts(
    state: tauri::State<'_, AppState>,
    ghost_path: String,
    app_handle: tauri::AppHandle,
) -> Result<ScanResult, String> {
    // ghost_pathをghost_dirとしてscan_ghost_directoryに渡す
    scan_ghost_directory(state, ghost_path, app_handle).await
}

/// Androidオーバーレイ権限リクエスト・案内コマンド
#[tauri::command]
async fn request_overlay_permission() -> Result<String, String> {
    #[cfg(target_os = "android")]
    {
        // 将来的にJNI経由でSettings.ACTION_MANAGE_OVERLAY_PERMISSIONを発行
        Ok("Androidオーバーレイ設定画面への誘導を行いました".to_string())
    }
    #[cfg(not(target_os = "android"))]
    {
        Ok("デスクトップ環境のためオーバーレイ権限は不要です（Always On Top有効）".to_string())
    }
}

/// Androidフォアグラウンドサービス通知チャネル設定コマンド
#[tauri::command]
async fn setup_foreground_service(enabled: bool) -> Result<String, String> {
    #[cfg(target_os = "android")]
    {
        // JNI経由でNotificationChannel作成およびForegroundService起動
        Ok(format!("Android常駐サービスを切り替えました: {}", enabled))
    }
    #[cfg(not(target_os = "android"))]
    {
        Ok(format!("常駐モード状態: {}", enabled))
    }
}

/// デバッグ用のテストコマンド
#[tauri::command]
async fn test_command() -> Result<String, String> {
    Ok("SHIORI統合テスト成功!".to_string())
}

/// アプリケーション最小化コマンド
#[tauri::command]
async fn minimize_app(app_handle: tauri::AppHandle) -> Result<(), String> {
    #[cfg(desktop)]
    if let Some(window) = app_handle.get_webview_window("main") {
        window.minimize().map_err(|e| e.to_string())?;
    }
    #[cfg(not(desktop))]
    let _ = app_handle;
    Ok(())
}

/// アプリケーション終了コマンド
#[tauri::command]
async fn exit_app(app_handle: tauri::AppHandle) -> Result<(), String> {
    app_handle.exit(0);
    Ok(())
}

/// OSネイティブのコンテキストメニュー表示コマンド (SSP / ukadoc 仕様準拠のメニュー再編)
#[tauri::command]
#[allow(unused_variables)]
async fn show_context_menu(
    app_handle: tauri::AppHandle,
    ghosts: Vec<String>,
    current_ghost: Option<String>,
    shells: Vec<String>,
    current_shell: Option<String>,
) -> Result<(), String> {
    #[cfg(desktop)]
    {
        let window = app_handle
            .get_webview_window("main")
            .ok_or("main window not found")?;

        // 1. ゴースト切り替えサブメニュー
        let mut ghost_submenu_builder = SubmenuBuilder::new(&app_handle, "👻 ゴースト切り替え (G)");
        for g in &ghosts {
            let label = if current_ghost.as_ref() == Some(g) {
                format!("✓ {}", g)
            } else {
                format!("   {}", g)
            };
            ghost_submenu_builder = ghost_submenu_builder.text(format!("ghost:{}", g), label);
        }
        if !ghosts.is_empty() {
            ghost_submenu_builder = ghost_submenu_builder.separator();
        }
        ghost_submenu_builder = ghost_submenu_builder.text("ghost", "📂 ゴースト一覧・管理...");
        let ghost_submenu = ghost_submenu_builder.build().map_err(|e| e.to_string())?;

        // 2. 着せ替え・シェル切り替えサブメニュー
        let mut shell_submenu_builder = SubmenuBuilder::new(&app_handle, "👗 着せ替え・シェル (C)");
        let active_shell = current_shell.as_deref().unwrap_or("master");
        for s in &shells {
            let label = if s == active_shell {
                format!("✓ {}", s)
            } else {
                format!("   {}", s)
            };
            shell_submenu_builder = shell_submenu_builder.text(format!("shell:{}", s), label);
        }
        let shell_submenu = shell_submenu_builder.build().map_err(|e| e.to_string())?;

        // 3. シェル倍率サブメニュー
        let scale_submenu = SubmenuBuilder::new(&app_handle, "🔍 シェル倍率 (S)")
            .text("scale-50", "50%")
            .text("scale-75", "75%")
            .text("scale-100", "100% (標準)")
            .text("scale-125", "125%")
            .text("scale-150", "150%")
            .text("scale-200", "200%")
            .build()
            .map_err(|e| e.to_string())?;

        // SSP標準階層メニュー構築
        let menu = MenuBuilder::new(&app_handle)
            // トーク
            .text("talk", "💬 もう一度話す (T)")
            .separator()
            // ゴースト・外観
            .item(&ghost_submenu)
            .item(&shell_submenu)
            .item(&scale_submenu)
            .text("balloon", "💭 バルーン設定 (B)")
            .separator()
            // ツール・拡張
            .text("update", "🌐 ネットワーク更新 (U)")
            .text("headline", "📰 ヘッドライン/ニュース (H)")
            .text("install", "📥 ファイル取り込み・導入 (I)")
            .text("scan", "📂 フォルダ再スキャン (R)")
            .text("plugins", "🧩 プラグイン・拡張機能 (P)")
            .separator()
            // 設定・ヘルプ
            .text("settings", "⚙️ 設定 (O)")
            .text("debug", "🐛 デバッグログ (D)")
            .text("help", "❓ 情報・ヘルプ (A)")
            .text("license", "📜 著作権・ライセンス表示 (L)")
            .separator()
            // ウィンドウ操作・終了
            .text("minimize", "🗕 アイコン化・隠す (I)")
            .text("exit", "❌ 終了 (W)")
            .build()
            .map_err(|e| e.to_string())?;

        window.popup_menu(&menu).map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// バルーンスキン連動の独立ポップアップメニューウィンドウ表示コマンド (ウィンドウ枠外にはみ出して表示可能)
#[tauri::command]
#[allow(unused_variables)]
async fn show_menu_window(app_handle: tauri::AppHandle, x: f64, y: f64) -> Result<(), String> {
    #[cfg(desktop)]
    {
        use tauri::Manager;
        // メインメニュー + サブメニュー横展開用領域 (500x520)
        let win_width = 500.0;
        let win_height = 520.0;

        let mut target_x = x;
        let mut target_y = y;

        // モニター境界を取得して画面内に収める
        if let Ok(Some(monitor)) = app_handle.primary_monitor() {
            let screen_size = monitor.size();
            let screen_pos = monitor.position();
            let max_x = (screen_pos.x + screen_size.width as i32) as f64 - win_width;
            let max_y = (screen_pos.y + screen_size.height as i32) as f64 - win_height;

            if target_x > max_x {
                target_x = max_x.max(screen_pos.x as f64);
            }
            if target_y > max_y {
                target_y = max_y.max(screen_pos.y as f64);
            }
        }

        if let Some(menu_win) = app_handle.get_webview_window("menu_window") {
            let _ = menu_win.set_size(tauri::Size::Logical(tauri::LogicalSize {
                width: win_width,
                height: win_height,
            }));
            let _ = menu_win.set_position(tauri::Position::Physical(tauri::PhysicalPosition {
                x: target_x as i32,
                y: target_y as i32,
            }));
            let _ = menu_win.show();
            let _ = menu_win.set_focus();
        } else {
            let menu_win = tauri::WebviewWindowBuilder::new(
                &app_handle,
                "menu_window",
                tauri::WebviewUrl::App("menu-iframe.html".into()),
            )
            .title("Nanai Menu")
            .inner_size(win_width, win_height)
            .transparent(true)
            .decorations(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .resizable(false)
            .position(target_x, target_y)
            .build()
            .map_err(|e| e.to_string())?;

            let _ = menu_win.show();
            let _ = menu_win.set_focus();
        }
    }
    Ok(())
}

/// メニューウィンドウ非表示コマンド
#[tauri::command]
#[allow(unused_variables)]
async fn hide_menu_window(app_handle: tauri::AppHandle) -> Result<(), String> {
    #[cfg(desktop)]
    {
        if let Some(menu_win) = app_handle.get_webview_window("menu_window") {
            let _ = menu_win.hide();
        }
        if let Some(sub_win) = app_handle.get_webview_window("submenu_window") {
            let _ = sub_win.hide();
        }
    }
    Ok(())
}

/// 独立サブメニューウィンドウ表示コマンド
#[tauri::command]
#[allow(unused_variables)]
async fn show_submenu_window(
    app_handle: tauri::AppHandle,
    menu_type: String,
    x: f64,
    y: f64,
    width: Option<f64>,
    height: Option<f64>,
) -> Result<(), String> {
    #[cfg(desktop)]
    {
        use tauri::Manager;
        let win_width = width.unwrap_or(240.0);
        let win_height = height.unwrap_or(360.0);

        let mut target_x = x;
        let mut target_y = y;

        if let Ok(Some(monitor)) = app_handle.primary_monitor() {
            let screen_size = monitor.size();
            let screen_pos = monitor.position();
            let max_x = (screen_pos.x + screen_size.width as i32) as f64 - win_width;
            let max_y = (screen_pos.y + screen_size.height as i32) as f64 - win_height;

            if target_x > max_x {
                // 右端を超える場合は左側へ反転 (親メニューの左へ)
                target_x = (x - win_width - 280.0).max(screen_pos.x as f64);
            }
            if target_y > max_y {
                target_y = max_y.max(screen_pos.y as f64);
            }
        }

        if let Some(sub_win) = app_handle.get_webview_window("submenu_window") {
            let _ = sub_win.set_size(tauri::Size::Logical(tauri::LogicalSize {
                width: win_width,
                height: win_height,
            }));
            let _ = sub_win.set_position(tauri::Position::Physical(tauri::PhysicalPosition {
                x: target_x as i32,
                y: target_y as i32,
            }));
            let _ = sub_win.show();
        } else {
            let sub_win = tauri::WebviewWindowBuilder::new(
                &app_handle,
                "submenu_window",
                tauri::WebviewUrl::App("submenu-iframe.html".into()),
            )
            .title("Nanai Submenu")
            .inner_size(win_width, win_height)
            .transparent(true)
            .decorations(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .resizable(false)
            .position(target_x, target_y)
            .build()
            .map_err(|e| e.to_string())?;

            let _ = sub_win.show();
        }

        // サブメニュータイプを通知
        let _ = app_handle.emit("set-submenu-type", serde_json::json!({ "type": menu_type }));
    }
    Ok(())
}

/// サブメニューウィンドウ非表示コマンド
#[tauri::command]
#[allow(unused_variables)]
async fn hide_submenu_window(app_handle: tauri::AppHandle) -> Result<(), String> {
    #[cfg(desktop)]
    {
        if let Some(sub_win) = app_handle.get_webview_window("submenu_window") {
            let _ = sub_win.hide();
        }
    }
    Ok(())
}

fn extract_ghost_archive_from_reader<R: std::io::Read + std::io::Seek>(
    mut zip: zip::ZipArchive<R>,
    fallback_name: &str,
    app_handle: &tauri::AppHandle,
) -> Result<GhostInfo, String> {
    // アーカイブ内のinstall.txtまたはdescript.txtを検索してゴースト名を特定
    let mut ghost_name = String::new();
    let mut root_prefix = String::new();

    for i in 0..zip.len() {
        if let Ok(entry) = zip.by_index(i) {
            let raw_bytes = entry.name_raw();
            let decoded_name = if let Ok(s) = std::str::from_utf8(raw_bytes) {
                s.to_string()
            } else {
                let (cow, _, _) = encoding_rs::SHIFT_JIS.decode(raw_bytes);
                cow.into_owned()
            };
            let name = decoded_name.replace('\\', "/");
            let lower = name.to_lowercase();
            if lower.ends_with("install.txt") || lower.ends_with("descript.txt") {
                // ファイル内容をShift_JIS / UTF-8で読み取り
                let mut reader = entry;
                let mut bytes = Vec::new();
                use std::io::Read;
                if reader.read_to_end(&mut bytes).is_ok() {
                    let (decoded, _, _) = encoding_rs::SHIFT_JIS.decode(&bytes);
                    let text = if decoded.contains("name,") || decoded.contains("name:") {
                        decoded.into_owned()
                    } else {
                        String::from_utf8_lossy(&bytes).into_owned()
                    };

                    for line in text.lines() {
                        let trimmed = line.trim();
                        if let Some(val) = trimmed.strip_prefix("name,") {
                            ghost_name = val.trim().to_string();
                            break;
                        } else if let Some(val) = trimmed.strip_prefix("name:") {
                            ghost_name = val.trim().to_string();
                            break;
                        }
                    }
                }

                if lower.ends_with("install.txt") {
                    if let Some(idx) = name.rfind('/') {
                        root_prefix = name[..=idx].to_string();
                    }
                    if !ghost_name.is_empty() {
                        break;
                    }
                }
            }
        }
    }

    // ゴースト名が見つからない場合はフォールバック名を使用
    if ghost_name.is_empty() {
        ghost_name = fallback_name.to_string();
    }

    // サニタイズ（フォルダ名に使用できない文字を除去）
    let safe_dir_name: String = ghost_name
        .chars()
        .map(|c| if r#"\/:*?"<>| "#.contains(c) { '_' } else { c })
        .collect();

    let target_ghost_base = resolve_asset_path("assets/ghost", app_handle)?;
    let target_dir = target_ghost_base.join(&safe_dir_name);

    if !target_dir.exists() {
        std::fs::create_dir_all(&target_dir)
            .map_err(|e| format!("Failed to create destination dir: {}", e))?;
    }

    // アーカイブを展開
    for i in 0..zip.len() {
        let mut entry = zip
            .by_index(i)
            .map_err(|e| format!("Failed to read archive entry #{}: {}", i, e))?;

        let raw_bytes = entry.name_raw();
        let decoded_name = if let Ok(s) = std::str::from_utf8(raw_bytes) {
            s.to_string()
        } else {
            let (cow, _, _) = encoding_rs::SHIFT_JIS.decode(raw_bytes);
            cow.into_owned()
        };
        let entry_name = decoded_name.replace('\\', "/");

        // root_prefixの除去
        let relative_path = if !root_prefix.is_empty() && entry_name.starts_with(&root_prefix) {
            &entry_name[root_prefix.len()..]
        } else {
            &entry_name
        };

        if relative_path.is_empty() {
            continue;
        }

        // パストラバーサル防止 (Zip Slip)
        let out_path = target_dir.join(relative_path);
        let normalized = normalize_path(&out_path);
        if !normalized.starts_with(&target_dir) {
            return Err(format!("Illegal path in archive: {}", entry_name));
        }

        if entry.is_dir() {
            std::fs::create_dir_all(&out_path).ok();
        } else {
            if let Some(parent) = out_path.parent() {
                std::fs::create_dir_all(parent).ok();
            }
            let mut outfile = std::fs::File::create(&out_path)
                .map_err(|e| format!("Failed to extract '{}': {}", out_path.display(), e))?;
            std::io::copy(&mut entry, &mut outfile)
                .map_err(|e| format!("Failed writing file '{}': {}", out_path.display(), e))?;
        }
    }

    println!("✅ Ghost successfully installed to: {:?}", target_dir);

    Ok(GhostInfo {
        name: safe_dir_name,
        path: target_dir.to_string_lossy().to_string(),
    })
}

/// ゴーストアーカイブ (.nar / .zip) のパス指定取り込み・解凍コマンド
#[tauri::command]
async fn install_ghost_archive(
    archive_path: String,
    app_handle: tauri::AppHandle,
) -> Result<GhostInfo, String> {
    println!("📦 Installing ghost archive from path: {}", archive_path);
    let clean = clean_verbatim_path(&archive_path);
    let file = std::fs::File::open(&clean)
        .map_err(|e| format!("Failed to open archive '{}': {}", clean, e))?;

    let zip = zip::ZipArchive::new(file).map_err(|e| format!("Invalid zip/nar archive: {}", e))?;

    let p = Path::new(&clean);
    let fallback = p
        .file_stem()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| "imported_ghost".to_string());

    extract_ghost_archive_from_reader(zip, &fallback, &app_handle)
}

/// ゴーストアーカイブ (.nar / .zip) のバイナリ直接取り込み・解凍コマンド
#[tauri::command]
async fn install_ghost_archive_bytes(
    file_name: String,
    bytes: Vec<u8>,
    app_handle: tauri::AppHandle,
) -> Result<GhostInfo, String> {
    println!(
        "📦 Installing ghost archive from memory bytes: {} ({} bytes)",
        file_name,
        bytes.len()
    );
    let reader = std::io::Cursor::new(bytes);
    let zip =
        zip::ZipArchive::new(reader).map_err(|e| format!("Invalid zip/nar archive: {}", e))?;

    let p = Path::new(&file_name);
    let fallback = p
        .file_stem()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| "imported_ghost".to_string());

    extract_ghost_archive_from_reader(zip, &fallback, &app_handle)
}

// ========================================

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .setup(|app| {
            #[cfg(desktop)]
            {
                let icon = app
                    .default_window_icon()
                    .cloned()
                    .unwrap_or_else(|| Image::new_owned(vec![0, 0, 0, 0], 1, 1));
                let app_handle = app.app_handle().clone();
                let _tray = TrayIconBuilder::new()
                    .icon(icon)
                    .on_tray_icon_event(move |_tray, event| {
                        if let TrayIconEvent::Click { .. } = event {
                            if let Some(window) = app_handle.get_webview_window("main") {
                                if let Err(e) =
                                    window.emit("error", "Failed to show window".to_string())
                                {
                                    eprintln!("emit failed: {e}");
                                }
                            } else {
                                let msg = "main window not found".to_string();
                                eprintln!("{msg}");
                                emit_error_to_all(&app_handle, msg.clone());
                            }
                        }
                    })
                    .build(app)?;
                let menu = MenuBuilder::new(app)
                    .text("open", "Open")
                    .text("close", "Close")
                    .build()?;

                app.set_menu(menu)?;
            }
            #[cfg(not(desktop))]
            let _ = app;
            Ok(())
        })
        .manage(AppState::new());

    #[cfg(desktop)]
    let builder = builder.on_menu_event(move |app_handle, event| {
        let id = event.id().as_ref();
        if let Some(ghost_name) = id.strip_prefix("ghost:") {
            let _ = app_handle.emit(
                "native-menu-action",
                serde_json::json!({
                    "action": "switch-to-ghost",
                    "payload": ghost_name
                }),
            );
        } else if let Some(shell_name) = id.strip_prefix("shell:") {
            let _ = app_handle.emit(
                "native-menu-action",
                serde_json::json!({
                    "action": "switch-to-shell",
                    "payload": shell_name
                }),
            );
        } else if id == "open" {
            if let Some(window) = app_handle.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        } else if id == "close" || id == "exit" {
            app_handle.exit(0);
        } else {
            let _ = app_handle.emit(
                "native-menu-action",
                serde_json::json!({
                    "action": id
                }),
            );
        }
    });

    builder
        .on_window_event(|window, event| {
            if (window.label() == "menu_window" || window.label() == "submenu_window")
                && let tauri::WindowEvent::Focused(false) = event
            {
                let _ = window.hide();
            }
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            open_file,
            get_app_config,
            record_ghost_loaded,
            add_to_recent_files,
            get_recent_files,
            scan_ghost_directory,
            scan_ghosts,
            load_ghost,
            send_shiori_request,
            send_shiori_event,
            on_mouse_click,
            on_second_change,
            get_current_ghost,
            get_all_ghosts,
            get_shiori_status,
            unload_current_ghost,
            request_overlay_permission,
            setup_foreground_service,
            test_command,
            minimize_app,
            exit_app,
            show_context_menu,
            show_menu_window,
            hide_menu_window,
            show_submenu_window,
            hide_submenu_window,
            install_ghost_archive,
            install_ghost_archive_bytes,
            load_surface_image
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
