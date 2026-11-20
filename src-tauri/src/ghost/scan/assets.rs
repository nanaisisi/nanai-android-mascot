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
            &[
                "thumbnail.png",
                "thumbnail.jpg",
                "thumbnail.jpeg",
                "thumbnail.pnr",
            ],
        )
        .map(s),
        ai0: find_ci(&master, &["ai0.png"]).map(s),
        ai0_dark: find_ci(&master, &["ai0_dark.png"]).map(s),
        cursors: list_ext(&master, "cur"),
        icons: list_ext(&master, "ico"),
    }
}

/// `.pnr` 画像バイト列を読み込み、左上ピクセル `(0, 0)` と同色のピクセルを透過 (`alpha = 0`) にした PNG バイト列を返す。
pub fn apply_top_left_transparency(bytes: &[u8]) -> Option<Vec<u8>> {
    let img = image::load_from_memory(bytes).ok()?;
    let (width, height) = (img.width(), img.height());
    if width == 0 || height == 0 {
        return None;
    }
    let mut rgba = img.to_rgba8();
    let top_left = *rgba.get_pixel(0, 0);
    for pixel in rgba.pixels_mut() {
        if pixel[0] == top_left[0] && pixel[1] == top_left[1] && pixel[2] == top_left[2] {
            pixel[3] = 0;
        }
    }
    let mut png_bytes = Vec::new();
    let mut cursor = std::io::Cursor::new(&mut png_bytes);
    rgba.write_to(&mut cursor, image::ImageFormat::Png).ok()?;
    Some(png_bytes)
}

/// サムネイルファイルを読み込み、`.pnr` の場合は左上 1px 透過を適用して Data URL (`data:image/...;base64,...`) を返す。
pub fn load_ghost_thumbnail_data_url(path: &Path) -> Option<String> {
    use base64::Engine;
    let bytes = std::fs::read(path).ok()?;
    let ext = path
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_ascii_lowercase())
        .unwrap_or_default();

    let (mime, out_bytes) = if ext == "pnr" {
        ("image/png", apply_top_left_transparency(&bytes)?)
    } else if ext == "jpg" || ext == "jpeg" {
        ("image/jpeg", bytes)
    } else {
        ("image/png", bytes)
    };

    let b64 = base64::engine::general_purpose::STANDARD.encode(&out_bytes);
    Some(format!("data:{mime};base64,{b64}"))
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

    #[test]
    fn pnr_thumbnail_applies_top_left_transparency() {
        let mut img = image::RgbaImage::new(2, 2);
        img.put_pixel(0, 0, image::Rgba([10, 20, 30, 255]));
        img.put_pixel(1, 0, image::Rgba([10, 20, 30, 255]));
        img.put_pixel(0, 1, image::Rgba([200, 100, 50, 255]));
        img.put_pixel(1, 1, image::Rgba([0, 0, 0, 255]));

        let mut raw_png = Vec::new();
        img.write_to(
            &mut std::io::Cursor::new(&mut raw_png),
            image::ImageFormat::Png,
        )
        .unwrap();

        let transparent_png = apply_top_left_transparency(&raw_png).unwrap();
        let decoded = image::load_from_memory(&transparent_png)
            .unwrap()
            .to_rgba8();
        assert_eq!(decoded.get_pixel(0, 0)[3], 0);
        assert_eq!(decoded.get_pixel(1, 0)[3], 0);
        assert_eq!(decoded.get_pixel(0, 1)[3], 255);
        assert_eq!(decoded.get_pixel(1, 1)[3], 255);

        let d = std::env::temp_dir().join(format!("nam_pnr_{}", std::process::id()));
        let m = d.join("ghost").join("master");
        std::fs::create_dir_all(&m).unwrap();
        let pnr_path = m.join("thumbnail.pnr");
        std::fs::write(&pnr_path, &raw_png).unwrap();

        let assets = discover_ghost_assets(&d);
        assert!(
            assets
                .thumbnail
                .as_deref()
                .is_some_and(|p| p.ends_with("thumbnail.pnr"))
        );
        let data_url = load_ghost_thumbnail_data_url(&pnr_path).unwrap();
        assert!(data_url.starts_with("data:image/png;base64,"));

        std::fs::remove_dir_all(&d).ok();
    }
}
