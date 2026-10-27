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

/// タイムライン計算の入力パターン（フロントエンド側で抽選済みの待ち時間）
#[derive(serde::Deserialize)]
pub struct TimelinePattern {
    #[allow(dead_code)]
    index: u32,
    wait_ms: u32,
}

/// タイムラインの1フレーム（`index` フレームは `at_ms` 時刻に適用）
#[derive(serde::Serialize)]
pub struct TimelineFrame {
    at_ms: u32,
}

/// 実行スケジュール（1周期のフレーム列と周期長）
#[derive(serde::Serialize)]
pub struct AnimationTimeline {
    frames: Vec<TimelineFrame>,
    total_ms: u32,
}

/// SERIKO パターン列を実行スケジュール（適用時刻列）へ変換する
///
/// `crates/ui::animation` の `build_timeline` / `Timeline` に一元化しており、
/// フロントエンドは待ち時間の累積・周期長を自前計算しない。
#[tauri::command]
pub fn animation_timeline(patterns: Vec<TimelinePattern>) -> Result<AnimationTimeline, String> {
    use nanai_android_mascot_ui::Timeline;
    use nanai_android_mascot_ui::surfaces::{AnimationPattern, DrawMethod};

    let anims: Vec<AnimationPattern> = patterns
        .iter()
        .map(|p| AnimationPattern {
            index: p.index,
            method: DrawMethod::Overlay,
            surface: 0,
            wait: p.wait_ms,
            wait_max: None,
            x: 0,
            y: 0,
            options: vec![],
        })
        .collect();
    let timeline = Timeline::new(&anims);
    Ok(AnimationTimeline {
        frames: timeline
            .frames()
            .iter()
            .map(|f| TimelineFrame { at_ms: f.at_ms })
            .collect(),
        total_ms: timeline.total_ms(),
    })
}
