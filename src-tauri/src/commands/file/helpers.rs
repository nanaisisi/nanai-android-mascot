//! ファイル探索・画像クロマキー加工用ヘルパー

use nanai_vfs::resolve_vfs_path;
use base64::Engine;
use image::GenericImageView;
use std::path::{Path, PathBuf};

/// 大文字・小文字の差異を吸収して実在するファイルを探索するヘルパー
pub fn find_file_case_insensitive(path: &Path) -> Option<PathBuf> {
    if path.exists() && path.is_file() {
        return Some(path.to_path_buf());
    }
    let parent = path.parent()?;
    let file_name = path.file_name()?.to_str()?;
    resolve_vfs_path(parent, file_name)
}

/// 画像バイト列を読み込み、左上ピクセル色および緑色背景領域をクロマキー透過(A=0)に変換して
/// PNGのDataURL (data:image/png;base64,...) として返却するヘルパー
pub fn process_chromakey_image_bytes(bytes: &[u8]) -> Option<String> {
    if let Ok(img) = image::load_from_memory(bytes) {
        let (width, height) = img.dimensions();
        if width == 0 || height == 0 {
            return None;
        }

        let mut rgba = img.to_rgba8();
        let top_left = rgba.get_pixel(0, 0);
        let target_r = top_left[0];
        let target_g = top_left[1];
        let target_b = top_left[2];

        for pixel in rgba.pixels_mut() {
            let r = pixel[0];
            let g = pixel[1];
            let b = pixel[2];

            let is_target_exact = r == target_r && g == target_g && b == target_b;
            let is_green_bg = g > 130
                && (g as u32) > ((r as u32) * 115 / 100)
                && (g as u32) > ((b as u32) * 115 / 100);

            if is_target_exact || is_green_bg {
                pixel[0] = 0;
                pixel[1] = 0;
                pixel[2] = 0;
                pixel[3] = 0;
            }
        }

        let mut png_bytes: Vec<u8> = Vec::new();
        let mut cursor = std::io::Cursor::new(&mut png_bytes);
        if rgba.write_to(&mut cursor, image::ImageFormat::Png).is_ok() {
            let b64 = base64::engine::general_purpose::STANDARD.encode(&png_bytes);
            return Some(format!("data:image/png;base64,{b64}"));
        }
    }
    None
}
