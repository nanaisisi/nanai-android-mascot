use super::image::*;
use super::info::*;
use super::manifest::*;
use base64::Engine;

#[test]
fn resolves_scope_specific_then_generic() {
    let d = std::env::temp_dir().join("nam_balloon_ui_asset_test");
    let _ = std::fs::remove_dir_all(&d);
    std::fs::create_dir_all(&d).unwrap();
    std::fs::write(d.join("clickwait.png"), b"x").unwrap();
    std::fs::write(d.join("clickwaitk.png"), b"x").unwrap();
    assert!(
        resolve_balloon_ui_asset(&d, "clickwait", 1)
            .unwrap()
            .ends_with("clickwaitk.png")
    );
    assert!(
        resolve_balloon_ui_asset(&d, "clickwait", 0)
            .unwrap()
            .ends_with("clickwait.png")
    );
    assert!(resolve_balloon_ui_asset(&d, "ok_up", 0).is_none());
    let _ = std::fs::remove_dir_all(&d);
}

#[test]
fn composites_sibling_pna_alpha_into_png_data_url() {
    let d = std::env::temp_dir().join("nam_balloon_pna_test");
    let _ = std::fs::remove_dir_all(&d);
    std::fs::create_dir_all(&d).unwrap();

    let base_path = d.join("balloons0.png");
    let pna_path = d.join("balloons0.pna");

    let base_img = image::RgbaImage::from_pixel(2, 2, image::Rgba([255, 10, 20, 255]));
    base_img.save(&base_path).unwrap();

    let mut pna_img = image::GrayImage::new(2, 2);
    pna_img.put_pixel(0, 0, image::Luma([128]));
    pna_img.put_pixel(1, 0, image::Luma([0]));
    pna_img.put_pixel(0, 1, image::Luma([64]));
    pna_img.put_pixel(1, 1, image::Luma([255]));
    pna_img.save(&pna_path).unwrap();

    assert_eq!(
        find_sibling_pna(&base_path).as_deref(),
        Some(pna_path.as_path())
    );
    assert!(find_sibling_pna(&pna_path).is_none());

    let composited = composite_pna_alpha(&base_path, &pna_path).unwrap();
    let decoded = image::load_from_memory(&composited).unwrap().to_rgba8();
    assert_eq!(decoded.get_pixel(0, 0).0, [255, 10, 20, 128]);
    assert_eq!(decoded.get_pixel(1, 0).0, [255, 10, 20, 0]);
    assert_eq!(decoded.get_pixel(0, 1).0, [255, 10, 20, 64]);
    assert_eq!(decoded.get_pixel(1, 1).0, [255, 10, 20, 255]);

    let data_url = encode_image_data_url(&base_path).unwrap();
    assert!(data_url.starts_with("data:image/png;base64,"));
    let b64 = data_url.trim_start_matches("data:image/png;base64,");
    let raw = base64::engine::general_purpose::STANDARD
        .decode(b64)
        .unwrap();
    let decoded_url = image::load_from_memory(&raw).unwrap().to_rgba8();
    assert_eq!(decoded_url.get_pixel(1, 0).0[3], 0);

    let _ = std::fs::remove_dir_all(&d);
}

#[test]
fn reads_balloon_readme_and_thumbnail_from_dir() {
    let d = std::env::temp_dir().join(format!("nam_balloon_rt_{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&d);
    std::fs::create_dir_all(&d).unwrap();

    assert!(read_balloon_readme_from_dir(&d).is_none());
    assert!(read_balloon_thumbnail_from_dir(&d).is_none());

    std::fs::write(d.join("readme.txt"), "balloon readme").unwrap();
    std::fs::write(d.join("thumbnail.png"), [1u8, 2, 3]).unwrap();

    assert_eq!(
        read_balloon_readme_from_dir(&d).as_deref(),
        Some("balloon readme")
    );
    let thumb = read_balloon_thumbnail_from_dir(&d).unwrap();
    assert!(thumb.starts_with("data:image/png;base64,"));

    let _ = std::fs::remove_dir_all(&d);
}

#[test]
fn test_resolve_balloon_option_candidates_scope_p_and_input_box() {
    let input_cands = resolve_balloon_option_candidates(Some(0), None, Some(2), true);
    assert_eq!(
        input_cands,
        vec![
            "balloonc2s.txt".to_string(),
            "balloonc0s.txt".to_string(),
            "ballooncs.txt".to_string()
        ]
    );

    let p_cands = resolve_balloon_option_candidates(Some(2), None, Some(1), false);
    assert_eq!(p_cands[0], "balloonp2def1s.txt");
    assert_eq!(p_cands[1], "balloonpdef1s.txt");
    assert!(p_cands.contains(&"balloonk1s.txt".to_string()));
    assert!(p_cands.contains(&"balloons1s.txt".to_string()));
}

#[test]
fn test_merge_balloon_option_files_overrides_descript() {
    let d = std::env::temp_dir().join(format!("nam_balloon_opt_{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&d);
    std::fs::create_dir_all(&d).unwrap();
    std::fs::write(d.join("balloonp2def0s.txt"), "font.color.r,255\n").unwrap();
    std::fs::write(d.join("balloonc1s.txt"), "font.color.g,128\n").unwrap();

    let mut p_map = std::collections::BTreeMap::new();
    p_map.insert("font.color.r".to_string(), "0".to_string());
    merge_balloon_option_files(&d, Some(2), None, Some(0), false, &mut p_map);
    assert_eq!(p_map.get("font.color.r").map(String::as_str), Some("255"));

    let mut c_map = std::collections::BTreeMap::new();
    c_map.insert("font.color.g".to_string(), "0".to_string());
    merge_balloon_option_files(&d, None, None, Some(1), true, &mut c_map);
    assert_eq!(c_map.get("font.color.g").map(String::as_str), Some("128"));

    let _ = std::fs::remove_dir_all(&d);
}
