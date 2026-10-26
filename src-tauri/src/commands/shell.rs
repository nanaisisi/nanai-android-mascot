//! シェルマニフェスト取得コマンド（Rust パース結果の JS 側への提供）
//!
//! ukadoc-spec のシェル定義（descript.txt / surfaces.txt / surfacetable.txt）
//! を `nanai_android_mascot_ui::Shell` でパースし、
//! `ShellManifest`（serde JSON）としてフロントエンドへ返す。

use crate::common::*;
use nanai_android_mascot_ui::{Shell, ShellManifest};
use std::path::PathBuf;

/// シェルディレクトリを解決する（ゴースト名 + シェル名 → 実パス）
fn resolve_shell_dir(
    ghost_name: &str,
    shell_name: &str,
    app_handle: &tauri::AppHandle,
) -> Result<PathBuf, String> {
    for base in [
        format!("assets/ghost/{}", ghost_name),
        format!("ghost/{}", ghost_name),
    ] {
        if let Ok(resolved) = resolve_asset_path(&base, app_handle)
            && resolved.exists()
        {
            let dir = resolved.join("shell").join(shell_name);
            if dir.is_dir() {
                return Ok(dir);
            }
        }
    }
    Err(format!(
        "shell directory not found: ghost={}, shell={}",
        ghost_name, shell_name
    ))
}

/// シェルをパースして JSON マニフェストを返す
///
/// `ghost_name`: ゴースト名（`assets/ghost/<ghost_name>` または `<ghost_name>`）
/// `shell_name`: シェル名（既定 `master`）
#[tauri::command]
pub fn shell_manifest(
    ghost_name: String,
    shell_name: String,
    app_handle: tauri::AppHandle,
) -> Result<ShellManifest, String> {
    let shell_dir = resolve_shell_dir(&ghost_name, &shell_name, &app_handle)?;
    let shell = Shell::load(&shell_dir).map_err(|e| e.to_string())?;
    Ok(shell.manifest())
}

/// さくらスクリプト文字列を Rust コアでパースして SakuraCommand 配列を返す
#[tauri::command]
pub fn parse_sakura_script(
    script: String,
) -> Result<Vec<nanai_android_mascot_ui::SakuraCommand>, String> {
    Ok(nanai_android_mascot_ui::parse_sakura_script(&script))
}

/// surfaces.txt の文字列を Rust コアでパースして SurfaceManifest マップを返す
#[tauri::command]
pub fn parse_surfaces_text(
    content: String,
) -> Result<std::collections::BTreeMap<u32, nanai_android_mascot_ui::SurfaceManifest>, String> {
    let surfaces_txt = nanai_android_mascot_ui::parse_surfaces_txt(&content);
    let mut map = std::collections::BTreeMap::new();
    for (id, def) in surfaces_txt.surfaces.iter() {
        map.insert(
            *id,
            nanai_android_mascot_ui::SurfaceManifest {
                number: *id,
                name: def.name.clone(),
                definition: def.clone(),
            },
        );
    }
    Ok(map)
}

