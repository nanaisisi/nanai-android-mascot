//! ゴーストディレクトリのスキャン（Tauri コマンド）

use crate::common::*;
use tauri::Manager;

mod descript;
mod shell;

pub use self::descript::read_descript_file;
pub use self::shell::scan_shells_from_ghost;

/// ゴーストスキャン結果
#[derive(Debug, Clone, serde::Serialize)]
pub struct ScanResult {
    ghosts: Vec<GhostInfo>,
    resolved_path: String,
    input_path: String,
}

fn format_system_time(sys_time: std::time::SystemTime) -> Option<String> {
    let dur = sys_time.duration_since(std::time::UNIX_EPOCH).ok()?;
    let secs = dur.as_secs();
    let days = secs / 86400;
    let remainder = secs % 86400;
    let hours = remainder / 3600;
    let minutes = (remainder % 3600) / 60;
    let seconds = remainder % 60;

    let mut year = 1970;
    let mut remaining_days = days as i64;
    loop {
        let leap = (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
        let days_in_year = if leap { 366 } else { 365 };
        if remaining_days < days_in_year {
            break;
        }
        remaining_days -= days_in_year;
        year += 1;
    }
    let mut month = 1;
    let leap = (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
    let days_in_months = [31, if leap { 29 } else { 28 }, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    for &dim in &days_in_months {
        if remaining_days < dim {
            break;
        }
        remaining_days -= dim;
        month += 1;
    }
    let day = remaining_days + 1;
    Some(format!("{:04}-{:02}-{:02} {:02}:{:02}:{:02}", year, month, day, hours, minutes, seconds))
}

/// ゴーストディレクトリのインストール日時と更新日時を算出する
///
/// - インストール日時: ゴーストディレクトリ自体の作成日時（取得不可なら更新日時）
/// - 更新日時: `updates2.dau`、`ghost/master/descript.txt`、`ghost/master` 内のファイル群（セーブファイル等を除く）の最新更新日時
pub fn compute_ghost_dates(path: &std::path::Path) -> (Option<String>, Option<String>) {
    let mut install_date = None;
    if let Ok(meta) = std::fs::metadata(path) {
        let created = meta.created().ok().and_then(format_system_time);
        let modified = meta.modified().ok().and_then(format_system_time);
        install_date = created.or(modified);
    }

    let dau_path = path.join("updates2.dau");
    let master_dir = path.join("ghost").join("master");
    let master_desc_path = master_dir.join("descript.txt");

    let mut latest_mtime: Option<std::time::SystemTime> = None;
    let mut consider = |p: &std::path::Path| {
        if let Ok(meta) = std::fs::metadata(p)
            && let Ok(mtime) = meta.modified()
        {
            latest_mtime = Some(match latest_mtime {
                Some(prev) if prev > mtime => prev,
                _ => mtime,
            });
        }
    };

    consider(&dau_path);
    consider(&master_desc_path);
    consider(&path.join("descript.txt"));
    consider(&path.join("install.txt"));

    if let Ok(entries) = std::fs::read_dir(&master_dir) {
        for entry in entries.flatten() {
            let entry_path = entry.path();
            if entry_path.is_file() {
                let fname = entry
                    .file_name()
                    .to_string_lossy()
                    .to_ascii_lowercase();
                // 起動や会話のたびに書き換わる SHIORI セーブデータ・ログ・プロファイルは除外し、
                // 本来のゴースト定義・辞書・スクリプトの更新日時を反映する
                let is_runtime_save = fname.ends_with("_variable.cfg")
                    || fname.ends_with("savedata.txt")
                    || fname.ends_with("savedata.dat")
                    || fname.ends_with(".sav")
                    || fname.ends_with(".log")
                    || fname.ends_with(".bak")
                    || fname.ends_with(".tmp")
                    || fname == "profile";
                if !is_runtime_save {
                    consider(&entry_path);
                }
            }
        }
    }

    let update_date = latest_mtime
        .and_then(format_system_time)
        .or_else(|| install_date.clone());

    (install_date, update_date)
}

/// ゴーストディレクトリをフルスキャンして完全なゴースト情報を取得
#[tauri::command]
pub async fn scan_ghost_directory(
    _state: tauri::State<'_, AppState>,
    ghost_dir: String,
    app_handle: tauri::AppHandle,
) -> Result<ScanResult, String> {
    let ghost_path = resolve_asset_path(&ghost_dir, &app_handle)?;

    println!("🔍 Input path: {}", ghost_dir);
    println!("🔍 Resolved absolute path: {:?}", ghost_path);

    // userData/ghost (ユーザーデータ) 優先探索パスの構築 (SSP / 伺か標準仕様準拠)
    let mut paths_to_scan = Vec::new();
    if let Ok(app_data_dir) = app_handle.path().app_data_dir() {
        let user_ghost_dir = app_data_dir.join("userData").join("ghost");
        if user_ghost_dir.exists() {
            paths_to_scan.push(user_ghost_dir);
        }
        let alt_user_ghost_dir = app_data_dir.join("ghost");
        if alt_user_ghost_dir.exists() && !paths_to_scan.contains(&alt_user_ghost_dir) {
            paths_to_scan.push(alt_user_ghost_dir);
        }
    }
    if !paths_to_scan.contains(&ghost_path) {
        paths_to_scan.push(ghost_path.clone());
    }

    let mut ghosts = Vec::new();
    let mut scanned_names = std::collections::HashSet::new();

    for scan_dir in paths_to_scan {
        if let Ok(entries) = std::fs::read_dir(&scan_dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_dir() {
                    let dir_name = entry.file_name().to_string_lossy().to_string();
                    if !dir_name.starts_with('.') {
                        // ゴーストフォルダ内に .dev_ignore ファイルが存在する場合は除外
                        if path.join(".dev_ignore").exists() {
                            println!("🚫 Skipping ghost directory with .dev_ignore: {:?}", path);
                            continue;
                        }

                        // ghost/master/descript.txt または descript.txt
                        let descript_candidates = [
                            path.join("ghost").join("master").join("descript.txt"),
                            path.join("descript.txt"),
                            path.join("install.txt"),
                        ];
                        let mut meta_map = None;
                        for cand in &descript_candidates {
                            if let Some(map) = read_descript_file(cand) {
                                meta_map = Some(map);
                                break;
                            }
                        }

                        let display_name = meta_map
                            .as_ref()
                            .and_then(|m| m.get("name").cloned())
                            .unwrap_or_else(|| dir_name.clone());

                        // 既に優先パス（userData等）でスキャン済みのゴースト名はスキップ（優先探索）
                        if scanned_names.contains(&display_name) {
                            continue;
                        }
                        scanned_names.insert(display_name.clone());

                        let version = meta_map.as_ref().and_then(|m| m.get("version").cloned());
                        let sakura_name = meta_map
                            .as_ref()
                            .and_then(|m| m.get("sakura.name").cloned());
                        let kero_name = meta_map.as_ref().and_then(|m| m.get("kero.name").cloned());
                        let shiori = meta_map.as_ref().and_then(|m| m.get("shiori").cloned());
                        let craftman = meta_map.as_ref().and_then(|m| m.get("craftman").cloned());
                        let craftman_url = meta_map
                            .as_ref()
                            .and_then(|m| m.get("craftmanurl").cloned());

                        let (install_date, update_date) = compute_ghost_dates(&path);
                        let dau_path = path.join("updates2.dau");

                        let update_result = if dau_path.exists() {
                            Some("OK(0)".to_string())
                        } else {
                            Some("-".to_string())
                        };
                        let group = meta_map.as_ref().and_then(|m| m.get("group").cloned());

                        // 全シェルをスキャン
                        let shells = scan_shells_from_ghost(&path);

                        ghosts.push(GhostInfo {
                            name: display_name,
                            version,
                            path: path.to_string_lossy().to_string(),
                            sakura_name,
                            kero_name,
                            shiori,
                            craftman,
                            craftman_url,
                            shells,
                            group,
                            install_date,
                            update_date,
                            update_result,
                        });
                    }
                }
            }
        }
    }

    if ghosts.is_empty() {
        let mock_nanai_path = ghost_path.join("mock_nanai");
        if mock_nanai_path.exists() {
            let shells = scan_shells_from_ghost(&mock_nanai_path);
            let (install_date, update_date) = if let Ok(meta) = std::fs::metadata(&mock_nanai_path) {
                let modified = meta.modified().ok().and_then(format_system_time);
                let created = meta.created().ok().and_then(format_system_time);
                (created.or(modified.clone()), modified)
            } else {
                (None, None)
            };
            ghosts.push(GhostInfo {
                name: "mock_nanai".to_string(),
                version: Some("1.0.0".to_string()),
                path: mock_nanai_path.to_string_lossy().to_string(),
                sakura_name: Some("なない".to_string()),
                kero_name: None,
                shiori: None,
                craftman: None,
                craftman_url: None,
                shells,
                group: None,
                install_date,
                update_date,
                update_result: Some("OK(0)".to_string()),
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
