//! サーフィス画像および PNA マスク読み込みコマンド

use super::helpers::{find_file_case_insensitive, process_chromakey_image_bytes};
use crate::common::paths::{
    clean_verbatim_path, resolve_asset_path, resolve_ghost_directory, resolve_vfs_path,
};
use crate::common::win_icon::{
    CursorAssetData, decode_cursor_asset_from_bytes, encode_win_icon_or_cursor_data_url,
};
use base64::Engine;
use std::fs;
use std::path::{Path, PathBuf};

fn resolve_shell_dirs_from_ghost_root(base_ghost_path: &Path, sn: &str) -> (PathBuf, PathBuf) {
    let shell_root = resolve_vfs_path(base_ghost_path, "shell")
        .filter(|p| p.is_dir())
        .unwrap_or_else(|| base_ghost_path.join("shell"));
    let shell_dir = resolve_vfs_path(&shell_root, sn)
        .filter(|p| p.is_dir())
        .unwrap_or_else(|| shell_root.join(sn));
    let master_dir = resolve_vfs_path(&shell_root, "master")
        .filter(|p| p.is_dir())
        .unwrap_or_else(|| shell_root.join("master"));
    (shell_dir, master_dir)
}

fn resolve_ghost_and_shell_dirs(
    gp: &str,
    sn: &str,
    app_handle: &tauri::AppHandle<tauri::Wry>,
) -> (PathBuf, PathBuf, PathBuf) {
    let clean_gp = clean_verbatim_path(gp);
    let mut base_ghost_path =
        resolve_asset_path(&clean_gp, app_handle).unwrap_or_else(|_| PathBuf::from(&clean_gp));
    if !base_ghost_path.is_dir()
        && let Some(ghost_name) = Path::new(&clean_gp).file_name().and_then(|n| n.to_str())
        && !ghost_name.is_empty()
        && let Ok(resolved_dir) = resolve_ghost_directory(ghost_name, app_handle)
    {
        base_ghost_path = resolved_dir;
    }
    let (shell_dir, master_dir) = resolve_shell_dirs_from_ghost_root(&base_ghost_path, sn);
    (base_ghost_path, shell_dir, master_dir)
}

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

    let (base_ghost_path, shell_dir, master_dir) =
        resolve_ghost_and_shell_dirs(&gp, &sn, &app_handle);

    println!(
        "🖼️ [Rust File] load_surface_image: ghost_path={}, shell={}, surface={}, base_path={:?}",
        gp, sn, sid, base_ghost_path
    );

    let parsed_id = sid.parse::<u32>().ok();
    let candidates = build_surface_image_candidates(&shell_dir, &master_dir, &sid, parsed_id);

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

            if let Some(data_url) = encode_win_icon_or_cursor_data_url(&ext, &bytes) {
                return Ok(data_url);
            }

            if ext != "svg"
                && ext != "pna"
                && ext != "gif"
                && ext != "webp"
                && !(ext == "png" && is_apng(&bytes))
                && let Some(data_url) = process_chromakey_image_bytes(&bytes)
            {
                return Ok(data_url);
            }

            let mime = match ext.as_str() {
                "svg" => "image/svg+xml",
                "bmp" => "image/bmp",
                "gif" => "image/gif",
                "webp" => "image/webp",
                "jpg" | "jpeg" => "image/jpeg",
                _ => "image/png",
            };
            let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
            return Ok(format!("data:{mime};base64,{b64}"));
        }
    }

    if let Some(surface_id_num) = parsed_id {
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

    let (_base_ghost_path, shell_dir, master_dir) =
        resolve_ghost_and_shell_dirs(&gp, &sn, &app_handle);
    let parsed_id = sid.parse::<u32>().ok();
    let candidates = build_surface_pna_candidates(&shell_dir, &master_dir, &sid, parsed_id);

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

/// `.cur` / `.ani` / `.ico` 等のカーソルアセットをフレーム列（Data URL + ホットスポット + 待ち時間）として読み込む
#[tauri::command]
#[specta::specta]
pub fn load_cursor_asset(
    base_kind: String,
    file: String,
    ghost_path: Option<String>,
    shell_name: Option<String>,
    balloon_name: Option<String>,
    app_handle: tauri::AppHandle<tauri::Wry>,
) -> Result<Option<CursorAssetData>, String> {
    let clean_file = file.trim().trim_start_matches(['/', '\\']);
    if clean_file.is_empty() {
        return Ok(None);
    }

    let mut search_paths: Vec<PathBuf> = Vec::new();
    match base_kind.as_str() {
        "balloon" => {
            if let Some(name) = balloon_name
                && let Ok(dir) =
                    crate::commands::shell::balloon::resolve_balloon_dir(&name, &app_handle)
            {
                search_paths.push(dir.join(clean_file));
            }
        }
        "shell" => {
            if let Some(gp) = ghost_path {
                let sn = shell_name.unwrap_or_else(|| "master".to_string());
                let (base_gp, shell_dir, master_dir) =
                    resolve_ghost_and_shell_dirs(&gp, &sn, &app_handle);
                search_paths.push(shell_dir.join(clean_file));
                search_paths.push(master_dir.join(clean_file));
                search_paths.push(base_gp.join("ghost").join("master").join(clean_file));
            }
        }
        "ghost" => {
            if let Some(gp) = ghost_path {
                let clean_gp = clean_verbatim_path(&gp);
                let base_gp = resolve_asset_path(&clean_gp, &app_handle)
                    .unwrap_or_else(|_| PathBuf::from(&clean_gp));
                search_paths.push(base_gp.join("ghost").join("master").join(clean_file));
                search_paths.push(base_gp.join(clean_file));
            }
        }
        _ => {
            let clean_path = clean_verbatim_path(clean_file);
            let resolved = resolve_asset_path(&clean_path, &app_handle)
                .unwrap_or_else(|_| PathBuf::from(&clean_path));
            search_paths.push(resolved);
        }
    }

    for candidate in search_paths {
        if let Some(target) = find_file_case_insensitive(&candidate)
            && target.is_file()
            && let Ok(bytes) = fs::read(&target)
        {
            let ext = target
                .extension()
                .and_then(|e| e.to_str())
                .unwrap_or("png")
                .to_lowercase();
            return Ok(decode_cursor_asset_from_bytes(&ext, &bytes));
        }
    }

    Ok(None)
}

fn build_surface_image_candidates(
    shell_dir: &std::path::Path,
    master_dir: &std::path::Path,
    sid: &str,
    parsed_id: Option<u32>,
) -> Vec<PathBuf> {
    let Some(surface_id_num) = parsed_id else {
        return vec![
            shell_dir.join(format!("{sid}.png")),
            shell_dir.join(format!("{sid}.bmp")),
            shell_dir.join(format!("{sid}.svg")),
            shell_dir.join(format!("{sid}.ico")),
            shell_dir.join(format!("{sid}.cur")),
            shell_dir.join(format!("{sid}.ani")),
            shell_dir.join(format!("{sid}.pna")),
            master_dir.join(format!("{sid}.png")),
            master_dir.join(format!("{sid}.bmp")),
            master_dir.join(format!("{sid}.svg")),
            master_dir.join(format!("{sid}.ico")),
            master_dir.join(format!("{sid}.cur")),
            master_dir.join(format!("{sid}.ani")),
            master_dir.join(format!("{sid}.pna")),
        ];
    };

    let mut candidates = vec![
        shell_dir.join(format!("surface{sid}.png")),
        shell_dir.join(format!("surface{surface_id_num:04}.png")),
        shell_dir.join(format!("surface{surface_id_num:02}.png")),
        shell_dir.join(format!("surface{sid}.bmp")),
        shell_dir.join(format!("surface{surface_id_num:04}.bmp")),
        shell_dir.join(format!("surface{sid}.svg")),
        shell_dir.join(format!("surface{sid}.gif")),
        shell_dir.join(format!("surface{surface_id_num:04}.gif")),
        shell_dir.join(format!("surface{sid}.webp")),
        shell_dir.join(format!("surface{surface_id_num:04}.webp")),
        shell_dir.join(format!("surface{sid}.ico")),
        shell_dir.join(format!("surface{surface_id_num:04}.ico")),
        shell_dir.join(format!("surface{sid}.cur")),
        shell_dir.join(format!("surface{surface_id_num:04}.cur")),
        shell_dir.join(format!("surface{sid}.ani")),
        shell_dir.join(format!("surface{surface_id_num:04}.ani")),
        shell_dir.join(format!("surface{sid}.jpg")),
        shell_dir.join(format!("surface{sid}.jpeg")),
        shell_dir.join(format!("surface{sid}.pna")),
        shell_dir.join(format!("Surface{sid}.png")),
        shell_dir.join(format!("Surface{surface_id_num:04}.png")),
        master_dir.join(format!("surface{sid}.png")),
        master_dir.join(format!("surface{surface_id_num:04}.png")),
        master_dir.join(format!("surface{surface_id_num:02}.png")),
        master_dir.join(format!("surface{sid}.bmp")),
        master_dir.join(format!("surface{surface_id_num:04}.bmp")),
        master_dir.join(format!("surface{sid}.svg")),
        master_dir.join(format!("surface{sid}.gif")),
        master_dir.join(format!("surface{surface_id_num:04}.gif")),
        master_dir.join(format!("surface{sid}.webp")),
        master_dir.join(format!("surface{surface_id_num:04}.webp")),
        master_dir.join(format!("surface{sid}.ico")),
        master_dir.join(format!("surface{surface_id_num:04}.ico")),
        master_dir.join(format!("surface{sid}.cur")),
        master_dir.join(format!("surface{surface_id_num:04}.cur")),
        master_dir.join(format!("surface{sid}.ani")),
        master_dir.join(format!("surface{surface_id_num:04}.ani")),
        master_dir.join(format!("surface{sid}.jpg")),
        master_dir.join(format!("surface{sid}.jpeg")),
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

    candidates
}

fn build_surface_pna_candidates(
    shell_dir: &std::path::Path,
    master_dir: &std::path::Path,
    sid: &str,
    parsed_id: Option<u32>,
) -> Vec<PathBuf> {
    let Some(surface_id_num) = parsed_id else {
        return vec![
            shell_dir.join(format!("{sid}.pna")),
            master_dir.join(format!("{sid}.pna")),
        ];
    };

    vec![
        shell_dir.join(format!("surface{sid}.pna")),
        shell_dir.join(format!("surface{surface_id_num:04}.pna")),
        shell_dir.join(format!("surface{surface_id_num:02}.pna")),
        shell_dir.join(format!("Surface{sid}.pna")),
        master_dir.join(format!("surface{sid}.pna")),
        master_dir.join(format!("surface{surface_id_num:04}.pna")),
        master_dir.join(format!("surface{surface_id_num:02}.pna")),
    ]
}

/// PNG バイト列が APNG (`acTL` チャンクを `IDAT` より前に含む) かどうかを判定する
fn is_apng(bytes: &[u8]) -> bool {
    const PNG_SIG: &[u8; 8] = b"\x89PNG\r\n\x1a\n";
    if bytes.len() < 8 || &bytes[..8] != PNG_SIG {
        return false;
    }
    let mut pos = 8;
    while pos + 12 <= bytes.len() {
        let len = u32::from_be_bytes([bytes[pos], bytes[pos + 1], bytes[pos + 2], bytes[pos + 3]])
            as usize;
        let chunk_type = &bytes[pos + 4..pos + 8];
        if chunk_type == b"acTL" {
            return true;
        }
        if chunk_type == b"IDAT" || chunk_type == b"IEND" {
            return false;
        }
        pos = match pos.checked_add(12 + len) {
            Some(next) => next,
            None => return false,
        };
    }
    false
}

#[cfg(test)]
mod tests {
    use super::{
        build_surface_image_candidates, build_surface_pna_candidates, is_apng,
        resolve_shell_dirs_from_ghost_root,
    };
    use std::path::Path;

    #[test]
    fn test_case_insensitive_shell_dirs_from_ghost_root() {
        let dir = std::env::temp_dir().join(format!("nam_shell_dirs_{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&dir);
        let custom_shell = dir.join("Shell").join("AltShell");
        let master_shell = dir.join("Shell").join("Master");
        std::fs::create_dir_all(&custom_shell).unwrap();
        std::fs::create_dir_all(&master_shell).unwrap();

        let (resolved_shell, resolved_master) =
            resolve_shell_dirs_from_ghost_root(&dir, "altshell");
        assert_eq!(resolved_shell, custom_shell);
        assert_eq!(resolved_master, master_shell);

        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn test_non_numeric_element_filename_resolution() {
        let shell_dir = Path::new("/ghost/shell/custom");
        let master_dir = Path::new("/ghost/shell/master");

        let img_candidates =
            build_surface_image_candidates(shell_dir, master_dir, "arm_left", None);
        assert!(img_candidates.contains(&shell_dir.join("arm_left.png")));
        assert!(img_candidates.contains(&master_dir.join("arm_left.png")));
        assert!(!img_candidates.contains(&shell_dir.join("surface0.png")));

        let pna_candidates = build_surface_pna_candidates(shell_dir, master_dir, "arm_left", None);
        assert_eq!(
            pna_candidates,
            vec![
                shell_dir.join("arm_left.pna"),
                master_dir.join("arm_left.pna"),
            ]
        );
    }

    #[test]
    fn test_numeric_surface_filename_resolution() {
        let shell_dir = Path::new("/ghost/shell/custom");
        let master_dir = Path::new("/ghost/shell/master");

        let img_candidates = build_surface_image_candidates(shell_dir, master_dir, "5", Some(5));
        assert!(img_candidates.contains(&shell_dir.join("surface5.png")));
        assert!(img_candidates.contains(&shell_dir.join("surface0005.png")));

        let pna_candidates = build_surface_pna_candidates(shell_dir, master_dir, "5", Some(5));
        assert!(pna_candidates.contains(&shell_dir.join("surface5.pna")));
        assert!(pna_candidates.contains(&shell_dir.join("surface0005.pna")));
    }

    #[test]
    fn test_animated_format_candidates_and_apng_detection() {
        let shell_dir = Path::new("/ghost/shell/custom");
        let master_dir = Path::new("/ghost/shell/master");
        let candidates = build_surface_image_candidates(shell_dir, master_dir, "0", Some(0));
        assert!(candidates.contains(&shell_dir.join("surface0.gif")));
        assert!(candidates.contains(&shell_dir.join("surface0.webp")));
        assert!(candidates.contains(&shell_dir.join("surface0.ico")));
        assert!(candidates.contains(&shell_dir.join("surface0.cur")));
        assert!(candidates.contains(&shell_dir.join("surface0.ani")));
        assert!(candidates.contains(&master_dir.join("surface0.gif")));
        assert!(candidates.contains(&master_dir.join("surface0.ico")));
        assert!(candidates.contains(&master_dir.join("surface0.cur")));
        assert!(candidates.contains(&master_dir.join("surface0.ani")));

        // PNG signature + acTL chunk before IDAT
        let mut apng = b"\x89PNG\r\n\x1a\n".to_vec();
        apng.extend_from_slice(&8u32.to_be_bytes());
        apng.extend_from_slice(b"acTL");
        apng.extend_from_slice(&[0u8; 8]);
        apng.extend_from_slice(&[0u8; 4]); // CRC
        assert!(is_apng(&apng));

        // Static PNG (IDAT before any acTL)
        let mut static_png = b"\x89PNG\r\n\x1a\n".to_vec();
        static_png.extend_from_slice(&0u32.to_be_bytes());
        static_png.extend_from_slice(b"IDAT");
        static_png.extend_from_slice(&[0u8; 4]);
        assert!(!is_apng(&static_png));
    }
}
