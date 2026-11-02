use crate::surfaces::compositor::{composite_elements, SurfaceFrameBuffer};
use crate::surfaces::types::DrawMethod;

#[test]
fn test_surface_frame_buffer_creation() {
    let fb = SurfaceFrameBuffer::new(10, 20);
    assert_eq!(fb.width, 10);
    assert_eq!(fb.height, 20);
    assert_eq!(fb.data.len(), 10 * 20 * 4);
    assert_eq!(fb.get_pixel(0, 0), Some((0, 0, 0, 0)));
    assert_eq!(fb.get_pixel(9, 19), Some((0, 0, 0, 0)));
    assert_eq!(fb.get_pixel(10, 20), None);

    let raw_data = vec![255; 4 * 2 * 2];
    let fb2 = SurfaceFrameBuffer::from_rgba(2, 2, raw_data).unwrap();
    assert_eq!(fb2.get_pixel(1, 1), Some((255, 255, 255, 255)));

    let invalid = SurfaceFrameBuffer::from_rgba(2, 2, vec![0; 5]);
    assert!(invalid.is_err());
}

#[test]
fn test_chromakey_transparency() {
    let mut fb = SurfaceFrameBuffer::new(2, 2);
    // (0,0) を背景色緑 (0, 255, 0, 255) に設定
    fb.set_pixel(0, 0, 0, 255, 0, 255);
    // (1,0) を純緑許容差内 (10, 240, 10, 255)
    fb.set_pixel(1, 0, 10, 240, 10, 255);
    // (0,1) をキャラクター色赤 (255, 0, 0, 255)
    fb.set_pixel(0, 1, 255, 0, 0, 255);
    // (1,1) を背景色緑 (0, 255, 0, 255)
    fb.set_pixel(1, 1, 0, 255, 0, 255);

    fb.apply_corner_chromakey();

    // 背景色が透明化されていること
    assert_eq!(fb.get_pixel(0, 0).unwrap().3, 0);
    assert_eq!(fb.get_pixel(1, 0).unwrap().3, 0);
    assert_eq!(fb.get_pixel(1, 1).unwrap().3, 0);

    // 赤色ピクセルは不透明を維持していること
    assert_eq!(fb.get_pixel(0, 1), Some((255, 0, 0, 255)));
}

#[test]
fn test_pna_mask_composition() {
    let mut fb = SurfaceFrameBuffer::new(2, 2);
    for y in 0..2 {
        for x in 0..2 {
            fb.set_pixel(x, y, 100, 150, 200, 255);
        }
    }

    let mask = vec![0, 128, 64, 255];
    assert!(fb.apply_pna_mask(&mask).is_ok());

    assert_eq!(fb.get_pixel(0, 0).unwrap().3, 0);
    assert_eq!(fb.get_pixel(1, 0).unwrap().3, 128);
    assert_eq!(fb.get_pixel(0, 1).unwrap().3, 64);
    assert_eq!(fb.get_pixel(1, 1).unwrap().3, 255);

    // RGB値は保持されていること
    assert_eq!(fb.get_pixel(1, 0), Some((100, 150, 200, 128)));

    // マスク長不足時のエラー確認
    let short_mask = vec![0, 128];
    assert!(fb.apply_pna_mask(&short_mask).is_err());
}

#[test]
fn test_composite_layer_overlay_and_replace() {
    let mut base = SurfaceFrameBuffer::new(4, 4);
    for y in 0..4 {
        for x in 0..4 {
            base.set_pixel(x, y, 50, 50, 50, 255);
        }
    }

    let mut layer = SurfaceFrameBuffer::new(2, 2);
    layer.set_pixel(0, 0, 200, 10, 10, 255);
    layer.set_pixel(1, 0, 200, 10, 10, 128);
    layer.set_pixel(0, 1, 0, 0, 0, 0); // 透明ピクセル
    layer.set_pixel(1, 1, 10, 200, 10, 255);

    // Overlay 合成
    let out = composite_elements(&base, &[(&layer, 1, 1, DrawMethod::Overlay)]);

    // layerの(0,0)がbaseの(1,1)に完全上書き(A=255)
    assert_eq!(out.get_pixel(1, 1), Some((200, 10, 10, 255)));
    // layerの(0,1)は透明なのでbaseのまま
    assert_eq!(out.get_pixel(1, 2), Some((50, 50, 50, 255)));

    // Replace 合成
    let mut replace_layer = SurfaceFrameBuffer::new(2, 2);
    replace_layer.set_pixel(0, 0, 0, 0, 0, 0);
    replace_layer.set_pixel(1, 1, 255, 255, 255, 255);

    let replaced = composite_elements(&base, &[(&replace_layer, 0, 0, DrawMethod::Replace)]);
    // Replace では透明ピクセルもそのまま置換される
    assert_eq!(replaced.get_pixel(0, 0), Some((0, 0, 0, 0)));
    assert_eq!(replaced.get_pixel(1, 1), Some((255, 255, 255, 255)));

    // ブレンド Multiply 合成
    let mut blend_layer = SurfaceFrameBuffer::new(2, 2);
    blend_layer.set_pixel(0, 0, 255, 255, 255, 255);
    let blended = composite_elements(&base, &[(&blend_layer, 0, 0, DrawMethod::Blend("multiply".into()))]);
    assert_eq!(blended.get_pixel(0, 0), Some((50, 50, 50, 255)));
}

#[test]
fn test_interpolate_compositing() {
    let mut base = SurfaceFrameBuffer::new(2, 2);
    base.set_pixel(0, 0, 100, 150, 200, 255);
    base.set_pixel(1, 0, 100, 150, 200, 255);

    let mut layer = SurfaceFrameBuffer::new(2, 2);
    // (0, 0) は base と同一色 -> 透過されるべき
    layer.set_pixel(0, 0, 100, 150, 200, 255);
    // (1, 0) は 異なる色 -> 上書き描画されるべき
    layer.set_pixel(1, 0, 255, 0, 0, 255);

    let result = composite_elements(&base, &[(&layer, 0, 0, DrawMethod::Interpolate)]);

    // 同一色は透過され元のbaseのまま
    assert_eq!(result.get_pixel(0, 0), Some((100, 150, 200, 255)));
    // 異なる色は上書きされる
    assert_eq!(result.get_pixel(1, 0), Some((255, 0, 0, 255)));
}

#[test]
fn test_extended_blend_modes() {
    let mut base = SurfaceFrameBuffer::new(2, 2);
    base.set_pixel(0, 0, 100, 100, 100, 255);

    let mut layer = SurfaceFrameBuffer::new(2, 2);
    layer.set_pixel(0, 0, 50, 50, 50, 255);

    // DrawMethod::Add
    let added = composite_elements(&base, &[(&layer, 0, 0, DrawMethod::Add)]);
    assert_eq!(added.get_pixel(0, 0), Some((150, 150, 150, 255)));

    // Blend difference
    let diff = composite_elements(&base, &[(&layer, 0, 0, DrawMethod::Blend("difference".into()))]);
    assert_eq!(diff.get_pixel(0, 0), Some((50, 50, 50, 255)));

    // Blend darken
    let darken = composite_elements(&base, &[(&layer, 0, 0, DrawMethod::Blend("darken".into()))]);
    assert_eq!(darken.get_pixel(0, 0), Some((50, 50, 50, 255)));

    // Blend lighten
    let lighten = composite_elements(&base, &[(&layer, 0, 0, DrawMethod::Blend("lighten".into()))]);
    assert_eq!(lighten.get_pixel(0, 0), Some((100, 100, 100, 255)));
}
