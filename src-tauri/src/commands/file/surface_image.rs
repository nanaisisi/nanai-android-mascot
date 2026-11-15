//! サーフィス画像および PNA マスク読み込みコマンド

use super::helpers::{find_file_case_insensitive, process_chromakey_image_bytes};
use crate::common::paths::{clean_verbatim_path, resolve_asset_path};
use base64::Engine;
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct LoadSurfaceImageParams {
    ghost_path: String,
    shell_name: String,
    surface_id: String,
}

impl LoadSurfaceImageParams {
    pub fn ghost_path(&self) -> &str {
        &self.ghost_path
    }
    pub fn shell_name(&self) -> &str {
        &self.shell_name
    }
    pub fn surface_id(&self) -> &str {
        &self.surface_id
    }
}

// サーフィス画像を読み込んでData URL (Base64) として返すコマンド
#[tauri::command]
pub fn load_surface_image(
    params: LoadSurfaceImageParams,
    app_handle: tauri::AppHandle<tauri::Wry>,
) -> Result<String, String> {
    let ghost_path = params.ghost_path();
    let shell_name = params.shell_name();
    let surface_id = params.surface_id();
    let clean_gp = clean_verbatim_path(ghost_path);
    let base_ghost_path =
        resolve_asset_path(&clean_gp, &app_handle).unwrap_or_else(|_| PathBuf::from(&clean_gp));

    println!(
        "🖼️ [Rust File] load_surface_image: ghost_path={}, shell={}, surface={}, base_path={:?}",
        ghost_path, shell_name, surface_id, base_ghost_path
    );

    let shell_dir = base_ghost_path.join("shell").join(shell_name);
    let master_dir = base_ghost_path.join("shell").join("master");

    let surface_id_num = surface_id.parse::<u32>().unwrap_or(0);
    let mut candidates = vec![
        shell_dir.join(format!("surface{surface_id}.png")),
        shell_dir.join(format!("surface{surface_id_num:04}.png")),
        shell_dir.join(format!("surface{surface_id_num:02}.png")),
        shell_dir.join(format!("surface{surface_id}.bmp")),
        shell_dir.join(format!("surface{surface_id_num:04}.bmp")),
        shell_dir.join(format!("surface{surface_id}.svg")),
        shell_dir.join(format!("surface{surface_id}.pna")),
        shell_dir.join(format!("Surface{surface_id}.png")),
        shell_dir.join(format!("Surface{surface_id_num:04}.png")),
        master_dir.join(format!("surface{surface_id}.png")),
        master_dir.join(format!("surface{surface_id_num:04}.png")),
        master_dir.join(format!("surface{surface_id_num:02}.png")),
        master_dir.join(format!("surface{surface_id}.bmp")),
        master_dir.join(format!("surface{surface_id_num:04}.bmp")),
        master_dir.join(format!("surface{surface_id}.svg")),
    ];

    if surface_id_num == 0 {
        candidates.push(shell_dir.join("surface0.png"));
        candidates.push(shell_dir.join("surface0000.png"));
        candidates.push(shell_dir.join("surface0.svg"));
        candidates.push(master_dir.join("surface0.png"));
        candidates.push(master_dir.join("surface0000.png"));
        candidates.push(master_dir.join("surface0.svg"));
    } else if surface_id_num == 10 {
        candidates.push(shell_dir.join("surface10.png"));
        candidates.push(shell_dir.join("surface0010.png"));
        candidates.push(shell_dir.join("surface10.svg"));
        candidates.push(master_dir.join("surface10.png"));
        candidates.push(master_dir.join("surface0010.png"));
        candidates.push(master_dir.join("surface10.svg"));
    }

    for candidate in &candidates {
        if let Some(target) = find_file_case_insensitive(candidate)
            && target.is_file()
            && let Ok(bytes) = fs::read(&target)
        {
            println!(
                "✅ [Rust File] load_surface_image 発見・ロード成功: path={:?}, size={}",
                target,
                bytes.len()
            );
            let ext = target
                .extension()
                .and_then(|e| e.to_str())
                .unwrap_or("png")
                .to_lowercase();

            if ext != "svg"
                && ext != "pna"
                && let Some(data_url) = process_chromakey_image_bytes(&bytes)
            {
                return Ok(data_url);
            }

            let mime = match ext.as_str() {
                "svg" => "image/svg+xml",
                "bmp" => "image/bmp",
                "pna" => "image/png",
                _ => "image/png",
            };
            let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
            return Ok(format!("data:{mime};base64,{b64}"));
        }
    }

    let fallback_candidates = if (10..20).contains(&surface_id_num) {
        vec![
            shell_dir.join("surface0010.png"),
            shell_dir.join("surface10.png"),
            master_dir.join("surface0010.png"),
            master_dir.join("surface10.png"),
            shell_dir.join("surface0000.png"),
            shell_dir.join("surface0.png"),
        ]
    } else {
        vec![
            shell_dir.join("surface0000.png"),
            shell_dir.join("surface0.png"),
            master_dir.join("surface0000.png"),
            master_dir.join("surface0.png"),
        ]
    };
    for candidate in &fallback_candidates {
        if let Some(target) = find_file_case_insensitive(candidate)
            && target.is_file()
            && let Ok(bytes) = fs::read(&target)
        {
            println!(
                "🔄 [Rust File] load_surface_image: surface{} 個別ファイル未検出のため適切なスコープフォールバックを利用します: {:?}",
                surface_id, target
            );
            if let Some(data_url) = process_chromakey_image_bytes(&bytes) {
                return Ok(data_url);
            }
            let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
            return Ok(format!("data:image/png;base64,{b64}"));
        }
    }

    println!(
        "⚠️ [Rust File] load_surface_image: 指定されたサーフィス画像が見つかりません (surface_id={}, shell={}).",
        surface_id, shell_name
    );
    Err(format!(
        "Surface image not found for surface_id: {surface_id} in shell: {shell_name}"
    ))
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct LoadSurfacePnaParams {
    ghost_path: String,
    shell_name: String,
    surface_id: String,
}

impl LoadSurfacePnaParams {
    pub fn ghost_path(&self) -> &str {
        &self.ghost_path
    }
    pub fn shell_name(&self) -> &str {
        &self.shell_name
    }
    pub fn surface_id(&self) -> &str {
        &self.surface_id
    }
}

// サーフィスに対応する PNA (アルファマスク) 画像を読み込んで返すコマンド
#[tauri::command]
pub fn load_surface_pna(
    params: LoadSurfacePnaParams,
    app_handle: tauri::AppHandle<tauri::Wry>,
) -> Result<String, String> {
    let ghost_path = params.ghost_path();
    let shell_name = params.shell_name();
    let surface_id = params.surface_id();
    let clean_gp = clean_verbatim_path(ghost_path);
    let base_ghost_path =
        resolve_asset_path(&clean_gp, &app_handle).unwrap_or_else(|_| PathBuf::from(&clean_gp));

    let shell_dir = base_ghost_path.join("shell").join(shell_name);
    let master_dir = base_ghost_path.join("shell").join("master");
    let surface_id_num = surface_id.parse::<u32>().unwrap_or(0);

    let candidates = vec![
        shell_dir.join(format!("surface{surface_id}.pna")),
        shell_dir.join(format!("surface{surface_id_num:04}.pna")),
        shell_dir.join(format!("surface{surface_id_num:02}.pna")),
        shell_dir.join(format!("Surface{surface_id}.pna")),
        master_dir.join(format!("surface{surface_id}.pna")),
        master_dir.join(format!("surface{surface_id_num:04}.pna")),
        master_dir.join(format!("surface{surface_id_num:02}.pna")),
    ];

    for candidate in candidates {
        if let Some(target) = find_file_case_insensitive(&candidate)
            && target.is_file()
            && let Ok(bytes) = fs::read(&target)
        {
            let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
            return Ok(format!("data:image/png;base64,{b64}"));
        }
    }

    Err(format!("PNA file not found for surface_id: {surface_id}"))
}
