//! サーフィス画像および PNA マスク読み込みコマンド

use super::helpers::{find_file_case_insensitive, process_chromakey_image_bytes};
use crate::common::paths::{clean_verbatim_path, resolve_asset_path};
use base64::Engine;
use std::fs;
use std::path::PathBuf;

// サーフィス画像を読み込んでData URL (Base64) として返すコマンド
#[tauri::command]
pub fn load_surface_image(
    ghost_path: Option<String>,
    #[allow(non_snake_case)] ghostPath: Option<String>,
    shell_name: Option<String>,
    #[allow(non_snake_case)] shellName: Option<String>,
    surface_id: Option<String>,
    #[allow(non_snake_case)] surfaceId: Option<String>,
    app_handle: tauri::AppHandle<tauri::Wry>,
) -> Result<String, String> {
    let gp = ghost_path.or(ghostPath).unwrap_or_default();
    let sn = shell_name.or(shellName).unwrap_or_default();
    let sid = surface_id.or(surfaceId).unwrap_or_else(|| "0".to_string());

    let clean_gp = clean_verbatim_path(&gp);
    let base_ghost_path =
        resolve_asset_path(&clean_gp, &app_handle).unwrap_or_else(|_| PathBuf::from(&clean_gp));

    println!(
        "🖼️ [Rust File] load_surface_image: ghost_path={}, shell={}, surface={}, base_path={:?}",
        gp, sn, sid, base_ghost_path
    );

    let shell_dir = base_ghost_path.join("shell").join(&sn);
    let master_dir = base_ghost_path.join("shell").join("master");

    let surface_id_num = sid.parse::<u32>().unwrap_or(0);
    let mut candidates = vec![
        shell_dir.join(format!("surface{sid}.png")),
        shell_dir.join(format!("surface{surface_id_num:04}.png")),
        shell_dir.join(format!("surface{surface_id_num:02}.png")),
        shell_dir.join(format!("surface{sid}.bmp")),
        shell_dir.join(format!("surface{surface_id_num:04}.bmp")),
        shell_dir.join(format!("surface{sid}.svg")),
        shell_dir.join(format!("surface{sid}.pna")),
        shell_dir.join(format!("Surface{sid}.png")),
        shell_dir.join(format!("Surface{surface_id_num:04}.png")),
        master_dir.join(format!("surface{sid}.png")),
        master_dir.join(format!("surface{surface_id_num:04}.png")),
        master_dir.join(format!("surface{surface_id_num:02}.png")),
        master_dir.join(format!("surface{sid}.bmp")),
        master_dir.join(format!("surface{surface_id_num:04}.bmp")),
        master_dir.join(format!("surface{sid}.svg")),
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
                sid, target
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
        sid, sn
    );
    Err(format!(
        "Surface image not found for surface_id: {sid} in shell: {sn}"
    ))
}

// サーフィスに対応する PNA (アルファマスク) 画像を読み込んで返すコマンド
#[tauri::command]
pub fn load_surface_pna(
    ghost_path: Option<String>,
    #[allow(non_snake_case)] ghostPath: Option<String>,
    shell_name: Option<String>,
    #[allow(non_snake_case)] shellName: Option<String>,
    surface_id: Option<String>,
    #[allow(non_snake_case)] surfaceId: Option<String>,
    app_handle: tauri::AppHandle<tauri::Wry>,
) -> Result<String, String> {
    let gp = ghost_path.or(ghostPath).unwrap_or_default();
    let sn = shell_name.or(shellName).unwrap_or_default();
    let sid = surface_id.or(surfaceId).unwrap_or_else(|| "0".to_string());

    let clean_gp = clean_verbatim_path(&gp);
    let base_ghost_path =
        resolve_asset_path(&clean_gp, &app_handle).unwrap_or_else(|_| PathBuf::from(&clean_gp));

    let shell_dir = base_ghost_path.join("shell").join(&sn);
    let master_dir = base_ghost_path.join("shell").join("master");
    let surface_id_num = sid.parse::<u32>().unwrap_or(0);

    let candidates = vec![
        shell_dir.join(format!("surface{sid}.pna")),
        shell_dir.join(format!("surface{surface_id_num:04}.pna")),
        shell_dir.join(format!("surface{surface_id_num:02}.pna")),
        shell_dir.join(format!("Surface{sid}.pna")),
        master_dir.join(format!("surface{sid}.pna")),
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

    Err(format!("PNA file not found for surface_id: {sid}"))
}
