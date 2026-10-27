//! シェルマニフェスト取得コマンド（Rust パース結果の JS 側への提供）
//!
//! ukadoc-spec のシェル定義（descript.txt / surfaces.txt / surfacetable.txt）
//! を `nanai_android_mascot_ui::Shell` でパースし、
//! `ShellManifest`（serde JSON）としてフロントエンドへ返す。

use crate::common::*;
use nanai_android_mascot_ui::surfaces::{CompositionLayer, DrawMethod};
use nanai_android_mascot_ui::{Shell, ShellManifest};
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};
use std::path::PathBuf;

/// バルーン情報を表す構造体
#[derive(serde::Serialize, Clone)]
pub struct BalloonInfo {
    pub dir_name: String,
    pub name: String,
    pub descript: std::collections::BTreeMap<String, String>,
}

/// バルーンの一覧を取得する
#[tauri::command]
pub fn scan_balloons(app_handle: tauri::AppHandle) -> Result<Vec<BalloonInfo>, String> {
    let mut balloons = Vec::new();
    // balloons は assets/balloon 直下
    for base_dir in ["assets/balloon", "balloon"] {
        if let Ok(resolved) = resolve_asset_path(base_dir, &app_handle) {
            if resolved.exists() && resolved.is_dir() {
                if let Ok(entries) = std::fs::read_dir(&resolved) {
                    for entry in entries.flatten() {
                        let path = entry.path();
                        if path.is_dir() {
                            let dir_name = entry.file_name().to_string_lossy().to_string();
                            if !dir_name.starts_with('.') {
                                let descript = balloon_descript_map(&path);
                                let name = descript
                                    .get("name")
                                    .cloned()
                                    .unwrap_or_else(|| dir_name.clone());
                                balloons.push(BalloonInfo {
                                    dir_name,
                                    name,
                                    descript,
                                });
                            }
                        }
                    }
                }
            }
        }
    }
    
    // ディレクトリ名の重複を排除（assets/balloon が優先される想定）
    let mut unique = std::collections::HashMap::new();
    for b in balloons {
        unique.entry(b.dir_name.clone()).or_insert(b);
    }
    let mut result: Vec<_> = unique.into_values().collect();
    result.sort_by(|a, b| a.name.cmp(&b.name));
    
    Ok(result)
}

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

/// ゴーストディレクトリを解決する（ゴースト名 → 実パス、未検出は None）
fn resolve_ghost_dir_opt(ghost_name: &str, app_handle: &tauri::AppHandle) -> Option<PathBuf> {
    for base in [
        format!("assets/ghost/{}", ghost_name),
        format!("ghost/{}", ghost_name),
    ] {
        if let Ok(resolved) = resolve_asset_path(&base, app_handle)
            && resolved.is_dir()
        {
            return Some(resolved);
        }
    }
    None
}

/// ゴーストをアンインストールする（SSP 右クリックメニュー「アンインストール」）
///
/// ゴーストディレクトリ（`assets/ghost/<name>` 等）を再帰削除する。
/// 確認ダイアログはフロントエンド側で表示する。
#[tauri::command]
pub async fn uninstall_ghost(
    ghost_name: String,
    app_handle: tauri::AppHandle,
) -> Result<bool, String> {
    let Some(dir) = resolve_ghost_dir_opt(&ghost_name, &app_handle) else {
        return Ok(false);
    };
    std::fs::remove_dir_all(&dir)
        .map(|_| true)
        .map_err(|e| format!("ゴーストの削除に失敗しました: {e}"))
}

/// バルーン descript.txt をパースしてプロパティ連想配列を返す
///
/// `name`: バルーン名（`assets/balloon/<name>`、例 `emily4`）
/// 戻り値は `font.height` 等の descript キー・値フラットマップ。
#[tauri::command]
pub fn balloon_manifest(
    name: String,
    app_handle: tauri::AppHandle,
) -> Result<std::collections::BTreeMap<String, String>, String> {
    let dir = resolve_balloon_dir(&name, &app_handle)?;
    Ok(balloon_descript_map(&dir))
}

/// バルーン画像アセット（balloons0.png / balloonk0.png 等）を Data URL (base64) として返す
///
/// ファイルが存在しない場合は `None`（背景画像を持たない CSS テーマ）。
/// 大文字・小文字の表記揺れは VFS で吸収する。
#[tauri::command]
pub fn load_balloon_image(
    name: String,
    file: String,
    app_handle: tauri::AppHandle,
) -> Result<Option<String>, String> {
    use base64::Engine;
    let dir = resolve_balloon_dir(&name, &app_handle)?;
    let Some(path) = nanai_android_mascot_ui::resolve_vfs_path(&dir, &file) else {
        return Ok(None);
    };
    let Ok(bytes) = std::fs::read(&path) else {
        return Ok(None);
    };
    let mime = match path
        .extension()
        .and_then(|e| e.to_str())
        .map(|s| s.to_lowercase())
    {
        Some(ref e) if e == "png" => "image/png",
        Some(ref e) if e == "bmp" => "image/bmp",
        Some(ref e) if e == "jpg" || e == "jpeg" => "image/jpeg",
        Some(ref e) if e == "svg" => "image/svg+xml",
        _ => "application/octet-stream",
    };
    Ok(Some(format!(
        "data:{mime};base64,{}",
        base64::engine::general_purpose::STANDARD.encode(bytes)
    )))
}

/// バルーンディレクトリを解決する（バルーン名 → 実パス）
fn resolve_balloon_dir(name: &str, app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    for base in [
        format!("assets/balloon/{}", name),
        format!("balloon/{}", name),
    ] {
        if let Ok(resolved) = resolve_asset_path(&base, app_handle)
            && resolved.is_dir()
        {
            return Ok(resolved);
        }
    }
    Err(format!("balloon directory not found: {}", name))
}

/// バルーン descript.txt を読み込み、キー・値のフラットマップへ変換する
fn balloon_descript_map(dir: &std::path::Path) -> std::collections::BTreeMap<String, String> {
    let descript = dir.join("descript.txt");
    let content = nanai_android_mascot_ui::open_text_file(&descript).unwrap_or_default();
    let parsed = nanai_android_mascot_ui::Descript::parse(&content);
    parsed
        .properties
        .into_iter()
        .collect::<std::collections::BTreeMap<_, _>>()
}

/// 合成計画のスナップショット（フロント Canvas 描画へ渡す形式）
#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CompositionPlanSnapshot {
    surface: u32,
    layers: Vec<PlanLayer>,
    plan_hash: String,
}

/// 合成計画の1レイヤー
#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlanLayer {
    /// `element`（surface ブロックの element）または `pattern`（装着 bind の pattern）
    kind: &'static str,
    /// 描画ファイル（element）。pattern の場合は空
    file: String,
    /// pattern の source サーフィス番号（element は 0）
    surface: i32,
    x: i32,
    y: i32,
    /// レガシー文字列化した描画メソッド（`base` / `overlay` / `blend-*` 等）
    method: String,
}

impl CompositionPlanSnapshot {
    /// Rust `CompositionPlan` をフロント契約 JSON へ変換する
    fn snapshot(plan: nanai_android_mascot_ui::surfaces::CompositionPlan) -> Self {
        let layers = plan
            .layers
            .iter()
            .map(|layer| match layer {
                CompositionLayer::Element(e) => PlanLayer {
                    kind: "element",
                    file: e.file.clone(),
                    surface: 0,
                    x: e.x,
                    y: e.y,
                    method: method_string(&e.method),
                },
                CompositionLayer::Pattern(p) => PlanLayer {
                    kind: "pattern",
                    file: String::new(),
                    surface: p.surface,
                    x: p.x,
                    y: p.y,
                    method: method_string(&p.method),
                },
            })
            .collect();
        let mut hasher = DefaultHasher::new();
        plan.surface.hash(&mut hasher);
        for layer in &plan.layers {
            match layer {
                CompositionLayer::Element(e) => {
                    "element".hash(&mut hasher);
                    e.file.hash(&mut hasher);
                    e.x.hash(&mut hasher);
                    e.y.hash(&mut hasher);
                    method_string(&e.method).hash(&mut hasher);
                }
                CompositionLayer::Pattern(p) => {
                    "pattern".hash(&mut hasher);
                    p.surface.hash(&mut hasher);
                    p.x.hash(&mut hasher);
                    p.y.hash(&mut hasher);
                    method_string(&p.method).hash(&mut hasher);
                }
            }
        }
        Self {
            surface: plan.surface,
            layers,
            plan_hash: format!("{:016x}", hasher.finish()),
        }
    }
}

/// `DrawMethod` をレガシー文字列化（JS `methodToString` と同等の変換を Rust 側で担保）
fn method_string(method: &DrawMethod) -> String {
    match method {
        DrawMethod::Base => "base".to_string(),
        DrawMethod::Overlay => "overlay".to_string(),
        DrawMethod::OverlayFast => "overlayfast".to_string(),
        DrawMethod::Interpolate => "interpolate".to_string(),
        DrawMethod::Replace => "replace".to_string(),
        DrawMethod::Add | DrawMethod::Bind => "add".to_string(),
        DrawMethod::Blend(name) => format!("blend-{name}"),
        DrawMethod::Custom(name) => name.clone(),
    }
}

/// 合成計画（MAYUNA: element 列 + 装着 bind pattern 列）を Rust コアで立てて返す
///
/// フロントは切替時（サーフィス・着せ替え・シェルの変更時）のみ呼び出し、
/// `plan_hash` をキーにレイヤー列をキャッシュする（アニメフレーム毎回の IPC は禁止）。
#[tauri::command]
pub fn surface_composition_plan(
    ghost_name: String,
    shell_name: String,
    surface_id: u32,
    binds: Option<Vec<u32>>,
    app_handle: tauri::AppHandle,
) -> Result<Option<CompositionPlanSnapshot>, String> {
    let shell_dir = resolve_shell_dir(&ghost_name, &shell_name, &app_handle)?;
    let shell = Shell::load(&shell_dir).map_err(|e| e.to_string())?;
    let plan = shell.composition_plan(surface_id, &binds.unwrap_or_default());
    Ok(plan.map(CompositionPlanSnapshot::snapshot))
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
