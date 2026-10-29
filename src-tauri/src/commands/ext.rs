//! プラグインおよびヘッドラインセンサーのスキャンコマンド (UKADOC / SSP 規格)

use crate::common::*;
use crate::ghost::scan::read_descript_file;
use tauri::Manager;

#[tauri::command]
pub async fn scan_plugins(
    app_handle: tauri::AppHandle,
) -> Result<Vec<PluginInfo>, String> {
    let mut plugins = Vec::new();
    let mut search_dirs = Vec::new();

    if let Ok(app_data_dir) = app_handle.path().app_data_dir() {
        search_dirs.push(app_data_dir.join("userData").join("plugin"));
        search_dirs.push(app_data_dir.join("plugin"));
    }
    if let Ok(current_dir) = std::env::current_dir() {
        search_dirs.push(current_dir.join("assets").join("plugin"));
    }

    for dir in search_dirs {
        if dir.exists() && dir.is_dir()
            && let Ok(entries) = std::fs::read_dir(dir) {
                for entry in entries.flatten() {
                    let path = entry.path();
                    if path.is_dir() {
                        let dir_name = entry.file_name().to_string_lossy().to_string();
                        if !dir_name.starts_with('.') {
                            // [descript.txt（Pluginの）]: プラグイン descript.txt 読込
                            let desc_path = path.join("descript.txt");
                            if let Some(map) = read_descript_file(&desc_path) {
                                // [name,プラグイン名], [id,ID名], [type,種別], [filename,ファイル名]:
                                let name = map.get("name").cloned().unwrap_or(dir_name);
                                let version = map.get("version").cloned();
                                // [craftman,作者名], [craftmanw,作者名], [craftmanurl,URL], [homeurl,URL]:
                                let craftman = map.get("craftman").cloned().or_else(|| map.get("craftmanw").cloned());
                                let craftman_url = map.get("craftmanurl").cloned().or_else(|| map.get("homeurl").cloned());
                                let description = map.get("description").cloned();

                                // [readme,ファイル名], [readme.charset,文字コード], [charset,文字コード], [secondchangeinterval,秒間隔], [otherghosttalk,0/1]:
                                let _readme = map.get("readme");
                                let _readme_cs = map.get("readme.charset");
                                let _cs = map.get("charset");
                                let _sec_interval = map.get("secondchangeinterval");
                                let _other_talk = map.get("otherghosttalk");

                                plugins.push(PluginInfo {
                                    name,
                                    version,
                                    path: path.to_string_lossy().to_string(),
                                    craftman,
                                    craftman_url,
                                    description,
                                });
                            }
                        }
                    }
                }
            }
    }

    Ok(plugins)
}

#[tauri::command]
pub async fn scan_headlines(
    app_handle: tauri::AppHandle,
) -> Result<Vec<HeadlineInfo>, String> {
    let mut headlines = Vec::new();
    let mut search_dirs = Vec::new();

    if let Ok(app_data_dir) = app_handle.path().app_data_dir() {
        search_dirs.push(app_data_dir.join("userData").join("headline"));
        search_dirs.push(app_data_dir.join("headline"));
    }
    if let Ok(current_dir) = std::env::current_dir() {
        search_dirs.push(current_dir.join("assets").join("headline"));
    }

    for dir in search_dirs {
        if dir.exists() && dir.is_dir()
            && let Ok(entries) = std::fs::read_dir(dir) {
                for entry in entries.flatten() {
                    let path = entry.path();
                    if path.is_dir() {
                        let dir_name = entry.file_name().to_string_lossy().to_string();
                        if !dir_name.starts_with('.') {
                            // [descript.txt（Headlineの）]: ヘッドライン descript.txt 読込
                            let desc_path = path.join("descript.txt");
                            if let Some(map) = read_descript_file(&desc_path) {
                                // [name,ヘッドライン名], [id,ID名], [type,種別]:
                                let name = map.get("name").cloned().unwrap_or(dir_name);
                                let version = map.get("version").cloned();
                                // [craftman,作者名], [craftmanw,作者名], [craftmanurl,URL], [homeurl,URL]:
                                let craftman = map.get("craftman").cloned().or_else(|| map.get("craftmanw").cloned());
                                let craftman_url = map.get("craftmanurl").cloned().or_else(|| map.get("homeurl").cloned());
                                // [url,URL], [openurl,URL]:
                                let url = map.get("url").cloned().or_else(|| map.get("openurl").cloned());

                                // [readme,ファイル名], [readme.charset,文字コード], [charset,文字コード], [alwaysdisplay,数値], [dllname,ファイル名]:
                                let _readme = map.get("readme");
                                let _readme_cs = map.get("readme.charset");
                                let _cs = map.get("charset");
                                let _always_disp = map.get("alwaysdisplay");
                                let _dllname = map.get("dllname");

                                headlines.push(HeadlineInfo {
                                    name,
                                    version,
                                    path: path.to_string_lossy().to_string(),
                                    craftman,
                                    craftman_url,
                                    url,
                                });
                            }
                        }
                    }
                }
            }
    }

    Ok(headlines)
}
