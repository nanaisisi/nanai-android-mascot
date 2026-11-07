//! サーフィス画像コンポジタのユニットテスト

use super::{SurfaceFrameBuffer, composite_elements};
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
    let blended = composite_elements(
        &base,
        &[(&blend_layer, 0, 0, DrawMethod::Blend("multiply".into()))],
    );
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
    let diff = composite_elements(
        &base,
        &[(&layer, 0, 0, DrawMethod::Blend("difference".into()))],
    );
    assert_eq!(diff.get_pixel(0, 0), Some((50, 50, 50, 255)));

    // Blend darken
    let darken = composite_elements(&base, &[(&layer, 0, 0, DrawMethod::Blend("darken".into()))]);
    assert_eq!(darken.get_pixel(0, 0), Some((50, 50, 50, 255)));

    // Blend lighten
    let lighten = composite_elements(
        &base,
        &[(&layer, 0, 0, DrawMethod::Blend("lighten".into()))],
    );
    assert_eq!(lighten.get_pixel(0, 0), Some((100, 100, 100, 255)));
}

#[test]
fn test_clear_and_clear_rect() {
    let mut fb = SurfaceFrameBuffer::new(4, 4);
    for y in 0..4 {
        for x in 0..4 {
            fb.set_pixel(x, y, 200, 200, 200, 255);
        }
    }
    assert_eq!(fb.get_pixel(1, 1), Some((200, 200, 200, 255)));

    // clear_rect (1, 1) width 2, height 2
    fb.clear_rect(1, 1, 2, 2);
    assert_eq!(fb.get_pixel(0, 0), Some((200, 200, 200, 255)));
    assert_eq!(fb.get_pixel(1, 1), Some((0, 0, 0, 0)));
    assert_eq!(fb.get_pixel(2, 2), Some((0, 0, 0, 0)));
    assert_eq!(fb.get_pixel(3, 3), Some((200, 200, 200, 255)));

    // out-of-bounds clear_rect
    fb.clear_rect(10, 10, 5, 5);

    // clear all
    fb.clear();
    assert_eq!(fb.get_pixel(0, 0), Some((0, 0, 0, 0)));
    assert_eq!(fb.get_pixel(3, 3), Some((0, 0, 0, 0)));
}

#[test]
fn test_reduce_and_fast_blend_compositing() {
    let mut base = SurfaceFrameBuffer::new(2, 2);
    // Base layer: color (100, 150, 200), alpha 200
    base.set_pixel(0, 0, 100, 150, 200, 200);
    base.set_pixel(1, 0, 100, 150, 200, 200);

    let mut layer = SurfaceFrameBuffer::new(2, 2);
    // New layer: color doesn't matter for reduce, alpha 128 (~50%)
    layer.set_pixel(0, 0, 255, 255, 255, 128);
    // Alpha 0 (transparent)
    layer.set_pixel(1, 0, 0, 0, 0, 0);

    let reduced = composite_elements(&base, &[(&layer, 0, 0, DrawMethod::Reduce)]);
    // Pixel (0, 0): alpha should be (200 * 128 + 127) / 255 = 100, RGB preserved
    let p0 = reduced.get_pixel(0, 0).unwrap();
    assert_eq!((p0.0, p0.1, p0.2), (100, 150, 200));
    assert_eq!(p0.3, 100);

    // Pixel (1, 0): alpha 0 * 200 = 0
    let p1 = reduced.get_pixel(1, 0).unwrap();
    assert_eq!((p1.0, p1.1, p1.2), (100, 150, 200));
    assert_eq!(p1.3, 0);

    // overlaymultiply / blend-multiply-fast test
    let mut base2 = SurfaceFrameBuffer::new(1, 1);
    base2.set_pixel(0, 0, 200, 200, 200, 255);
    let mut fast_layer = SurfaceFrameBuffer::new(1, 1);
    fast_layer.set_pixel(0, 0, 128, 128, 128, 255);

    let fast_mul = composite_elements(
        &base2,
        &[(&fast_layer, 0, 0, DrawMethod::Blend("multiply-fast".into()))],
    );
    let p_mul = fast_mul.get_pixel(0, 0).unwrap();
    assert_eq!(p_mul, (100, 100, 100, 255));
}

#[test]
fn test_compositor_blend_modes_and_bounds() {
    let mut base = SurfaceFrameBuffer::new(2, 2);
    base.set_pixel(0, 0, 100, 100, 100, 255);

    let mut layer = SurfaceFrameBuffer::new(2, 2);
    layer.set_pixel(0, 0, 100, 100, 100, 255);

    // AsIs
    let as_is = composite_elements(&base, &[(&layer, 0, 0, DrawMethod::AsIs)]);
    assert_eq!(as_is.get_pixel(0, 0), Some((100, 100, 100, 255)));

    // Screen & Screen-fast
    let screen = composite_elements(&base, &[(&layer, 0, 0, DrawMethod::Blend("screen".into()))]);
    assert!(screen.get_pixel(0, 0).is_some());

    let screen_fast = composite_elements(
        &base,
        &[(&layer, 0, 0, DrawMethod::Blend("screen-fast".into()))],
    );
    assert!(screen_fast.get_pixel(0, 0).is_some());

    // Lighter & Exclusion
    let lighter = composite_elements(
        &base,
        &[(&layer, 0, 0, DrawMethod::Blend("lighter".into()))],
    );
    assert!(lighter.get_pixel(0, 0).is_some());

    let exclusion = composite_elements(
        &base,
        &[(&layer, 0, 0, DrawMethod::Blend("exclusion".into()))],
    );
    assert!(exclusion.get_pixel(0, 0).is_some());

    // Out-of-bounds layer
    let oob = composite_elements(&base, &[(&layer, -10, -10, DrawMethod::Overlay)]);
    assert_eq!(oob.get_pixel(0, 0), Some((100, 100, 100, 255)));
}

#[test]
fn test_extended_blend_modes_subtract_divide_overlay_softlight() {
    let mut base = SurfaceFrameBuffer::new(2, 2);
    // Base: 120, 180, 200, 255
    base.set_pixel(0, 0, 120, 180, 200, 255);

    let mut layer = SurfaceFrameBuffer::new(2, 2);
    // Layer: 50, 60, 220, 255
    layer.set_pixel(0, 0, 50, 60, 220, 255);

    // Subtract: max(0, dst - src)
    // R: max(0, 120 - 50) = 70
    // G: max(0, 180 - 60) = 120
    // B: max(0, 200 - 220) = 0
    let sub = composite_elements(
        &base,
        &[(&layer, 0, 0, DrawMethod::Blend("subtract-fast".into()))],
    );
    assert_eq!(sub.get_pixel(0, 0), Some((70, 120, 0, 255)));

    // Divide: min(255, (dst * 255) / src)
    // R: (120 * 255) / 50 = 612 -> min(255) = 255
    // G: (180 * 255) / 60 = 765 -> min(255) = 255
    // B: (200 * 255) / 220 = 231
    let div = composite_elements(
        &base,
        &[(&layer, 0, 0, DrawMethod::Blend("divide-fast".into()))],
    );
    assert_eq!(div.get_pixel(0, 0), Some((255, 255, 231, 255)));

    // Overlay blend mode
    let overlay = composite_elements(
        &base,
        &[(&layer, 0, 0, DrawMethod::Blend("overlay-fast".into()))],
    );
    assert!(overlay.get_pixel(0, 0).is_some());

    // Softlight blend mode
    let softlight = composite_elements(
        &base,
        &[(&layer, 0, 0, DrawMethod::Blend("softlight-fast".into()))],
    );
    assert!(softlight.get_pixel(0, 0).is_some());

    // Color-dodge: min(255, (dst * 255) / (255 - src))
    // R: (120 * 255) / (255 - 50) = 30600 / 205 = 149
    // G: (180 * 255) / (255 - 60) = 45900 / 195 = 235
    // B: (200 * 255) / (255 - 220) = 51000 / 35 = 1457 -> 255
    let dodge = composite_elements(
        &base,
        &[(&layer, 0, 0, DrawMethod::Blend("color-dodge-fast".into()))],
    );
    assert_eq!(dodge.get_pixel(0, 0), Some((149, 235, 255, 255)));

    // Color-burn: max(0, 255 - ((255 - dst) * 255) / src)
    // R: 255 - (135 * 255) / 50 = 255 - 688 -> 0
    // G: 255 - (75 * 255) / 60 = 255 - 318 -> 0
    // B: 255 - (55 * 255) / 220 = 255 - 63 = 192
    let burn = composite_elements(
        &base,
        &[(&layer, 0, 0, DrawMethod::Blend("color-burn-fast".into()))],
    );
    assert_eq!(burn.get_pixel(0, 0), Some((0, 0, 192, 255)));

    // Linear-burn: max(0, dst + src - 255)
    // R: 0, G: 0, B: 200 + 220 - 255 = 165
    let l_burn = composite_elements(
        &base,
        &[(&layer, 0, 0, DrawMethod::Blend("linear-burn-fast".into()))],
    );
    assert_eq!(l_burn.get_pixel(0, 0), Some((0, 0, 165, 255)));

    // Linear-light: clamp(dst + 2*src - 255, 0, 255)
    // R: 120 + 100 - 255 = 0
    // G: 180 + 120 - 255 = 45
    // B: 200 + 440 - 255 = 385 -> 255
    let l_light = composite_elements(
        &base,
        &[(&layer, 0, 0, DrawMethod::Blend("linear-light-fast".into()))],
    );
    assert_eq!(l_light.get_pixel(0, 0), Some((0, 45, 255, 255)));

    // Hard-mix: linear-light >= 128 ? 255 : 0
    let h_mix = composite_elements(
        &base,
        &[(&layer, 0, 0, DrawMethod::Blend("hard-mix-fast".into()))],
    );
    assert_eq!(h_mix.get_pixel(0, 0), Some((0, 0, 255, 255)));

    // Pin-light: src < 128 ? min(dst, 2*src) : max(dst, 2*(src - 128))
    // R: min(120, 100) = 100
    // G: min(180, 120) = 120
    // B: max(200, 184) = 200
    let p_light = composite_elements(
        &base,
        &[(&layer, 0, 0, DrawMethod::Blend("pin-light-fast".into()))],
    );
    assert_eq!(p_light.get_pixel(0, 0), Some((100, 120, 200, 255)));

    // Hard-light: src < 128 ? (2*src*dst)/255 : 255 - 2*(255-src)*(255-dst)/255
    // R: (2 * 50 * 120) / 255 = 47
    // G: (2 * 60 * 180) / 255 = 84
    // B: 255 - 2*(35)*(55)/255 = 255 - 15 = 240
    let h_light = composite_elements(
        &base,
        &[(&layer, 0, 0, DrawMethod::Blend("hard-light-fast".into()))],
    );
    assert_eq!(h_light.get_pixel(0, 0), Some((47, 84, 240, 255)));
}

#[test]
fn test_chromakey_edge_cases() {
    let mut fb_zero = SurfaceFrameBuffer::new(0, 0);
    fb_zero.apply_corner_chromakey();

    let mut fb_custom = SurfaceFrameBuffer::new(1, 1);
    fb_custom.set_pixel(0, 0, 100, 150, 200, 255);
    fb_custom.apply_chromakey(100, 150, 200);
    assert_eq!(fb_custom.get_pixel(0, 0).unwrap().3, 0);
}

#[test]
fn test_framebuffer_edge_cases() {
    let mut fb = SurfaceFrameBuffer::new(2, 2);
    assert!(fb.get_pixel(5, 0).is_none());
    assert!(fb.get_pixel(0, 5).is_none());

    fb.set_pixel(5, 0, 255, 255, 255, 255);
    fb.set_pixel(0, 5, 255, 255, 255, 255);

    fb.clear_rect(0, 0, 0, 2);
    fb.clear_rect(0, 0, 2, 0);
    fb.clear_rect(5, 0, 1, 1);
    fb.clear_rect(0, 5, 1, 1);
    fb.clear_rect(1, 1, 5, 5);
    fb.clear();
}

#[test]
fn test_compositor_layer_edge_cases() {
    let mut base = SurfaceFrameBuffer::new(2, 2);
    base.set_pixel(0, 0, 100, 100, 100, 255);

    let layer_empty = SurfaceFrameBuffer::new(1, 1);
    let mut layer_sa0 = SurfaceFrameBuffer::new(1, 1);
    layer_sa0.set_pixel(0, 0, 50, 50, 50, 0);

    base.composite_layer(&layer_empty, -5, -5, &DrawMethod::Overlay);
    base.composite_layer(&layer_empty, 5, 5, &DrawMethod::Overlay);
    base.composite_layer(&layer_empty, -10, 0, &DrawMethod::Overlay);
    base.composite_layer(&layer_empty, 0, -10, &DrawMethod::Overlay);

    base.composite_layer(&layer_sa0, 0, 0, &DrawMethod::Interpolate);
    let mut layer_interp_same = SurfaceFrameBuffer::new(1, 1);
    layer_interp_same.set_pixel(0, 0, 100, 100, 100, 255);
    base.composite_layer(&layer_interp_same, 0, 0, &DrawMethod::Interpolate);

    base.composite_layer(&layer_sa0, 0, 0, &DrawMethod::Add);

    base.composite_layer(&layer_sa0, 0, 0, &DrawMethod::Blend("unknown-mode".into()));
    let mut layer_unknown = SurfaceFrameBuffer::new(1, 1);
    layer_unknown.set_pixel(0, 0, 100, 100, 100, 255);
    base.composite_layer(
        &layer_unknown,
        0,
        0,
        &DrawMethod::Blend("unknown-mode".into()),
    );

    let mut layer_sr0 = SurfaceFrameBuffer::new(1, 1);
    layer_sr0.set_pixel(0, 0, 0, 0, 0, 255);
    base.composite_layer(&layer_sr0, 0, 0, &DrawMethod::Blend("divide".into()));

    let mut layer_overlay_dark = SurfaceFrameBuffer::new(1, 1);
    layer_overlay_dark.set_pixel(0, 0, 50, 50, 50, 255);
    base.composite_layer(
        &layer_overlay_dark,
        0,
        0,
        &DrawMethod::Blend("overlay".into()),
    );

    let mut layer_overlay_light = SurfaceFrameBuffer::new(1, 1);
    layer_overlay_light.set_pixel(0, 0, 200, 200, 200, 255);
    base.composite_layer(
        &layer_overlay_light,
        0,
        0,
        &DrawMethod::Blend("overlay".into()),
    );

    let mut layer_soft_dark = SurfaceFrameBuffer::new(1, 1);
    layer_soft_dark.set_pixel(0, 0, 50, 50, 50, 255);
    base.composite_layer(
        &layer_soft_dark,
        0,
        0,
        &DrawMethod::Blend("softlight".into()),
    );

    let mut layer_soft_light = SurfaceFrameBuffer::new(1, 1);
    layer_soft_light.set_pixel(0, 0, 200, 200, 200, 255);
    base.composite_layer(
        &layer_soft_light,
        0,
        0,
        &DrawMethod::Blend("softlight".into()),
    );

    let mut layer_sa255 = SurfaceFrameBuffer::new(1, 1);
    layer_sa255.set_pixel(0, 0, 200, 200, 200, 255);
    base.composite_layer(&layer_sa255, 0, 0, &DrawMethod::Overlay);

    let mut layer_sa128 = SurfaceFrameBuffer::new(1, 1);
    layer_sa128.set_pixel(0, 0, 200, 200, 200, 128);
    base.composite_layer(&layer_sa128, 0, 0, &DrawMethod::Overlay);
}

#[test]
fn test_paint_transparent_region_black() {
    let mut fb = SurfaceFrameBuffer::new(2, 2);
    // (0, 0) is corner: green (0, 255, 0, 255)
    fb.set_pixel(0, 0, 0, 255, 0, 255);
    // (1, 0) has same color as corner but semi-transparent (0, 255, 0, 128)
    fb.set_pixel(1, 0, 0, 255, 0, 128);
    // (0, 1) has same color as corner but is completely transparent (0, 255, 0, 0)
    fb.set_pixel(0, 1, 0, 255, 0, 0);
    // (1, 1) is a different color (255, 0, 0, 255)
    fb.set_pixel(1, 1, 255, 0, 0, 255);

    fb.paint_corner_transparent_region_black();

    // (0, 0) was (0, 255, 0, 255) matching corner and alpha != 0 -> painted black (0, 0, 0, 255)
    assert_eq!(fb.get_pixel(0, 0), Some((0, 0, 0, 255)));
    // (1, 0) matching corner and alpha == 128 -> painted black (0, 0, 0, 128)
    assert_eq!(fb.get_pixel(1, 0), Some((0, 0, 0, 128)));
    // (0, 1) alpha == 0 -> skipped
    assert_eq!(fb.get_pixel(0, 1), Some((0, 255, 0, 0)));
    // (1, 1) different color -> unchanged
    assert_eq!(fb.get_pixel(1, 1), Some((255, 0, 0, 255)));
}

#[test]
fn test_advanced_blend_modes_add_glow_darker_lighter_color() {
    let mut base = SurfaceFrameBuffer::new(2, 2);
    base.set_pixel(0, 0, 100, 100, 100, 255);
    base.set_pixel(1, 0, 200, 200, 200, 255);
    base.set_pixel(0, 1, 50, 50, 50, 255);
    base.set_pixel(1, 1, 100, 100, 100, 255);

    let mut layer = SurfaceFrameBuffer::new(2, 2);
    // add-glow
    layer.set_pixel(0, 0, 100, 100, 100, 255);
    // darker-color: src is darker than dst(200,200,200)
    layer.set_pixel(1, 0, 50, 50, 50, 255);
    // lighter-color: src is brighter than dst(50,50,50)
    layer.set_pixel(0, 1, 150, 150, 150, 255);
    // color-dodge-glow
    layer.set_pixel(1, 1, 128, 128, 128, 255);

    // Test add-glow-fast on (0, 0)
    let mut b1 = base.clone();
    let mut l1 = SurfaceFrameBuffer::new(1, 1);
    l1.set_pixel(0, 0, 100, 100, 100, 255);
    b1.composite_layer(&l1, 0, 0, &DrawMethod::Blend("add-glow-fast".into()));
    assert_eq!(b1.get_pixel(0, 0), Some((200, 200, 200, 255)));

    // Test darker-color-fast on (1, 0)
    let mut b2 = base.clone();
    let mut l2 = SurfaceFrameBuffer::new(1, 1);
    l2.set_pixel(0, 0, 50, 50, 50, 255);
    b2.composite_layer(&l2, 1, 0, &DrawMethod::Blend("darker-color-fast".into()));
    assert_eq!(b2.get_pixel(1, 0), Some((50, 50, 50, 255)));

    // Test lighter-color-fast on (0, 1)
    let mut b3 = base.clone();
    let mut l3 = SurfaceFrameBuffer::new(1, 1);
    l3.set_pixel(0, 0, 150, 150, 150, 255);
    b3.composite_layer(&l3, 0, 1, &DrawMethod::Blend("lighter-color-fast".into()));
    assert_eq!(b3.get_pixel(0, 1), Some((150, 150, 150, 255)));
}
