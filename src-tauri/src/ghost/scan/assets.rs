//! ゴースト `ghost/master/` 配下の外部アセット（thumbnail / ai0 / cur / ico）探索

use std::path::{Path, PathBuf};

/// `ghost/master/` から検出した外部アセットのパス（存在するもののみ）
#[derive(Debug, Clone, Default, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub struct GhostAssets {
    pub thumbnail: Option<String>,
    pub ai0: Option<String>,
    pub ai0_dark: Option<String>,
    pub cursors: Vec<String>,
    pub icons: Vec<String>,
}

fn find_ci(dir: &Path, names: &[&str]) -> Option<PathBuf> {
    let entries: Vec<_> = std::fs::read_dir(dir).ok()?.flatten().collect();
    for want in names {
        for e in &entries {
            if e.file_name().to_string_lossy().eq_ignore_ascii_case(want) && e.path().is_file() {
                return Some(e.path());
            }
        }
    }
    None
}

fn list_ext(dir: &Path, ext: &str) -> Vec<String> {
    let mut v: Vec<String> = std::fs::read_dir(dir)
        .into_iter()
        .flatten()
        .flatten()
        .filter(|e| {
            e.path()
                .extension()
                .is_some_and(|x| x.to_string_lossy().eq_ignore_ascii_case(ext))
        })
        .map(|e| e.path().to_string_lossy().to_string())
        .collect();
    v.sort();
    v
}

/// ゴーストルートから `ghost/master/` のアセットを探索する。
pub fn discover_ghost_assets(ghost_root: &Path) -> GhostAssets {
    let master = ghost_root.join("ghost").join("master");
    let s = |p: PathBuf| p.to_string_lossy().to_string();
    GhostAssets {
        thumbnail: find_ci(
            &master,
            &["thumbnail.png", "thumbnail.jpg", "thumbnail.jpeg"],
        )
        .map(s),
        ai0: find_ci(&master, &["ai0.png"]).map(s),
        ai0_dark: find_ci(&master, &["ai0_dark.png"]).map(s),
        cursors: list_ext(&master, "cur"),
        icons: list_ext(&master, "ico"),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn discovers_assets_from_files() {
        let d = std::env::temp_dir().join(format!("nam_assets_{}", std::process::id()));
        let m = d.join("ghost").join("master");
        std::fs::create_dir_all(&m).unwrap();
        for f in ["Thumbnail.PNG", "ai0.png", "ai0_dark.png", "a.cur", "b.ico"] {
            std::fs::write(m.join(f), b"x").unwrap();
        }
        let a = discover_ghost_assets(&d);
        assert!(a.thumbnail.is_some() && a.ai0.is_some() && a.ai0_dark.is_some());
        assert_eq!((a.cursors.len(), a.icons.len()), (1, 1));
        std::fs::remove_dir_all(&d).ok();
        assert_eq!(discover_ghost_assets(&d), GhostAssets::default());
    }
}
