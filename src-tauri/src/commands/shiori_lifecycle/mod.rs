pub mod close;
pub mod load;
pub mod spawn;

#[allow(unused_imports)]
pub use close::{close_ghost, unload_current_ghost};
#[allow(unused_imports)]
pub use load::{load_ghost, reload_current_ghost_shiori};
#[allow(unused_imports)]
pub use spawn::spawn_ghost;

use crate::common::paths::resolve_vfs_path;
use crate::shiori::dynamic::ShioriDynamicEngine;
use crate::ui_adapter::shiori::{NativeShioriEngine, ShioriEngine};
use std::path::{Path, PathBuf};

/// `descript.txt` の `shiori` 指定から静的/フォールバックエンジン種別名を判定
pub(crate) fn detect_shiori_engine_name(shiori_spec: Option<&str>) -> &'static str {
    let lower = shiori_spec.unwrap_or_default().to_ascii_lowercase();
    if lower.contains("satori") {
        "satori"
    } else if lower.contains("yaya") || lower.contains("aya") {
        "yaya"
    } else if lower.contains("kawari") {
        "kawari"
    } else {
        "satori"
    }
}

/// ゴーストの `ghost/master` から動的ライブラリまたは静的/フォールバック SHIORI エンジンをロードする。
/// 戻り値の `bool` は動的ネイティブライブラリがロードされた場合 `true`、静的/フォールバック接続の場合 `false`。
pub(crate) fn resolve_and_load_shiori_engine(
    ghost_master_dir: &Path,
) -> Result<(Box<dyn ShioriEngine>, bool), String> {
    let descript_path = ghost_master_dir.join("descript.txt");
    let descript_map = crate::ghost::scan::read_descript_file(&descript_path);
    let shiori_spec = descript_map
        .as_ref()
        .and_then(|map| map.get("shiori"))
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty());

    #[cfg(not(target_os = "android"))]
    {
        let mut candidates = Vec::new();
        if let Some(ref rel_path) = shiori_spec {
            candidates.push(ghost_master_dir.join(rel_path));
            #[cfg(not(windows))]
            if let Some(stem) = rel_path.strip_suffix(".dll") {
                let so_name = format!("{}.so", stem);
                candidates.push(ghost_master_dir.join(&so_name));
                candidates.push(ghost_master_dir.join(format!("lib{}", so_name)));
            }
        }

        #[cfg(windows)]
        {
            candidates.push(ghost_master_dir.join("yaya.dll"));
            candidates.push(ghost_master_dir.join("satori.dll"));
            candidates.push(ghost_master_dir.join("kawari.dll"));
            candidates.push(ghost_master_dir.join("shiori.dll"));
            candidates.push(ghost_master_dir.join("satoriya.dll"));
            candidates.push(ghost_master_dir.join("aya5.dll"));
            candidates.push(ghost_master_dir.join("aya.dll"));
        }
        #[cfg(not(windows))]
        {
            candidates.push(ghost_master_dir.join("yaya.so"));
            candidates.push(ghost_master_dir.join("libyaya.so"));
            candidates.push(ghost_master_dir.join("satori.so"));
            candidates.push(ghost_master_dir.join("libsatori.so"));
            candidates.push(ghost_master_dir.join("kawari.so"));
            candidates.push(ghost_master_dir.join("libkawari.so"));
            candidates.push(ghost_master_dir.join("shiori.so"));
            candidates.push(ghost_master_dir.join("libshiori.so"));
        }

        for cand in candidates {
            let target_cand: Option<PathBuf> = if cand.exists() {
                Some(cand)
            } else if let Some(parent) = cand.parent()
                && parent.exists()
                && let Some(file_name) = cand.file_name().and_then(|n| n.to_str())
            {
                resolve_vfs_path(parent, file_name)
            } else {
                None
            };

            if let Some(cand_path) = target_cand {
                println!("🔍 Attempting to load SHIORI binary: {:?}", cand_path);
                match ShioriDynamicEngine::load_library(&cand_path) {
                    Ok(mut engine) => {
                        if let Err(e) = engine.load(ghost_master_dir) {
                            eprintln!("⚠️ Failed to initialize SHIORI at {:?}: {}", cand_path, e);
                        } else {
                            println!("🎉 Native SHIORI activated: {:?}", cand_path);
                            return Ok((Box::new(engine), true));
                        }
                    }
                    Err(e) => {
                        eprintln!("⚠️ Failed to load library {:?}: {}", cand_path, e);
                    }
                }
            }
        }
    }

    #[cfg(target_os = "android")]
    let _ = (
        &ShioriDynamicEngine::load_library,
        &resolve_vfs_path,
        PathBuf::new(),
    );

    let engine_name = detect_shiori_engine_name(shiori_spec.as_deref());
    let mut static_engine = NativeShioriEngine::new(engine_name);
    static_engine.load(ghost_master_dir)?;
    println!(
        "🧩 Static/fallback SHIORI engine activated (engine={}) for {:?}",
        engine_name, ghost_master_dir
    );
    Ok((Box::new(static_engine), false))
}
