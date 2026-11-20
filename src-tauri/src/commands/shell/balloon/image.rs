use super::info::resolve_balloon_dir;
use base64::Engine;
use std::path::{Path, PathBuf};

#[tauri::command]
pub fn load_balloon_image(
    name: String,
    file: String,
    app_handle: tauri::AppHandle,
) -> Result<Option<String>, String> {
    let dir = match resolve_balloon_dir(&name, &app_handle) {
        Ok(d) => d,
        Err(_) => {
            println!(
                "⚠️ [Balloon] load_balloon_image: balloon directory not found for name='{}'",
                name
            );
            return Ok(None);
        }
    };

    let direct_path = dir.join(&file);
    let req_ext = Path::new(&file)
        .extension()
        .and_then(|e| e.to_str())
        .map(|s| s.to_lowercase());
    let found_path = if direct_path.is_file() {
        Some(direct_path)
    } else if req_ext.as_deref() == Some("pna") {
        Path::new(&file)
            .file_stem()
            .and_then(|s| s.to_str())
            .and_then(|stem| {
                ["pna", "PNA"].iter().find_map(|ext| {
                    let p = dir.join(format!("{}.{}", stem, ext));
                    p.is_file().then_some(p)
                })
            })
    } else if let Some(stem) = Path::new(&file).file_stem().and_then(|s| s.to_str()) {
        let extensions = [
            "png", "bmp", "jpg", "jpeg", "gif", "svg", "PNG", "BMP", "JPG", "JPEG", "GIF", "SVG",
        ];
        let mut matched = None;
        for ext in &extensions {
            let alt_file = format!("{}.{}", stem, ext);
            let p = dir.join(&alt_file);
            if p.is_file() {
                matched = Some(p);
                break;
            }
        }
        if matched.is_none()
            && matches!(stem, "balloons0" | "balloonk0" | "balloonc0")
            && let Some(stripped_stem) = stem.strip_suffix('0')
        {
            for ext in &extensions {
                let alt_file = format!("{}.{}", stripped_stem, ext);
                let p = dir.join(&alt_file);
                if p.is_file() {
                    matched = Some(p);
                    break;
                }
            }
        }
        if matched.is_none()
            && matches!(
                stem,
                "balloons" | "balloons0" | "balloonk" | "balloonk0" | "balloonc" | "balloonc0"
            )
        {
            let fallback_files = if stem.starts_with("balloonk") {
                vec![
                    "balloonk0.png",
                    "balloonk0.bmp",
                    "balloonk.png",
                    "balloonk.bmp",
                ]
            } else if stem.starts_with("balloonc") {
                vec![
                    "balloonc0.png",
                    "balloonc0.bmp",
                    "balloonc.png",
                    "balloonc.bmp",
                ]
            } else {
                vec![
                    "balloons0.png",
                    "balloons0.bmp",
                    "balloons.png",
                    "balloons.bmp",
                ]
            };
            for fb in fallback_files {
                let p = dir.join(fb);
                if p.is_file() {
                    matched = Some(p);
                    break;
                }
            }
        }
        matched
    } else {
        None
    };

    let Some(path) = found_path else {
        println!(
            "⚠️ [Balloon] load_balloon_image 見つからず: name={}, file={}",
            name, file
        );
        return Ok(None);
    };

    println!("✅ [Balloon] load_balloon_image 成功: path={:?}", path);
    Ok(encode_image_data_url(&path))
}

pub fn find_sibling_pna(path: &Path) -> Option<PathBuf> {
    let ext = path
        .extension()
        .and_then(|e| e.to_str())
        .map(|s| s.to_lowercase());
    if ext.as_deref() == Some("pna") {
        return None;
    }
    let stem = path.file_stem()?.to_str()?;
    let parent = path.parent()?;
    ["pna", "PNA"].iter().find_map(|pna_ext| {
        let candidate = parent.join(format!("{}.{}", stem, pna_ext));
        candidate.is_file().then_some(candidate)
    })
}

pub fn composite_pna_alpha(base_path: &Path, pna_path: &Path) -> Option<Vec<u8>> {
    let mut base_img = image::open(base_path).ok()?.to_rgba8();
    let pna_img = image::open(pna_path).ok()?.to_luma8();
    let width = base_img.width().min(pna_img.width());
    let height = base_img.height().min(pna_img.height());

    for y in 0..height {
        for x in 0..width {
            let alpha = pna_img.get_pixel(x, y).0[0];
            base_img.get_pixel_mut(x, y).0[3] = alpha;
        }
    }

    let mut out = Vec::new();
    let mut cursor = std::io::Cursor::new(&mut out);
    image::DynamicImage::ImageRgba8(base_img)
        .write_to(&mut cursor, image::ImageFormat::Png)
        .ok()?;
    Some(out)
}

pub fn encode_image_data_url(path: &Path) -> Option<String> {
    if let Some(pna_path) = find_sibling_pna(path)
        && let Some(composited_png) = composite_pna_alpha(path, &pna_path)
    {
        return Some(format!(
            "data:image/png;base64,{}",
            base64::engine::general_purpose::STANDARD.encode(composited_png)
        ));
    }

    let bytes = std::fs::read(path).ok()?;
    let mime = match path
        .extension()
        .and_then(|e| e.to_str())
        .map(|s| s.to_lowercase())
    {
        Some(ref e) if e == "png" || e == "pna" => "image/png",
        Some(ref e) if e == "bmp" => "image/bmp",
        Some(ref e) if e == "jpg" || e == "jpeg" => "image/jpeg",
        Some(ref e) if e == "svg" => "image/svg+xml",
        Some(ref e) if e == "gif" => "image/gif",
        _ => "application/octet-stream",
    };
    Some(format!(
        "data:{mime};base64,{}",
        base64::engine::general_purpose::STANDARD.encode(bytes)
    ))
}

#[tauri::command]
pub fn load_balloon_ui_asset(
    name: String,
    stem: String,
    scope_id: i32,
    app_handle: tauri::AppHandle,
) -> Result<Option<String>, String> {
    let Ok(dir) = resolve_balloon_dir(&name, &app_handle) else {
        return Ok(None);
    };
    let Some(path) = resolve_balloon_ui_asset(&dir, &stem, scope_id) else {
        return Ok(None);
    };
    Ok(encode_image_data_url(&path))
}

pub fn resolve_balloon_ui_asset(dir: &Path, stem: &str, scope_id: i32) -> Option<PathBuf> {
    let suffix = match scope_id {
        0 => "s".to_string(),
        1 => "k".to_string(),
        n => format!("p{}", n),
    };
    let names = [format!("{}{}", stem, suffix), stem.to_string()];
    for n in &names {
        for ext in ["png", "bmp", "PNG", "BMP"] {
            let p = dir.join(format!("{}.{}", n, ext));
            if p.is_file() {
                return Some(p);
            }
        }
    }
    None
}
