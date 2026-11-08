/**
 * @file blend_modes.rs
 * @brief 各種ブレンドモード（Add, Sub, Multiply, Screen, Overlay, Softlight, HSL, Dither等）単体テスト
 */

use super::*;

#[test]
fn test_extended_blend_modes() {
    let mut base = SurfaceFrameBuffer::new(2, 2);
    base.set_pixel(0, 0, 100, 100, 100, 255);

    let mut layer = SurfaceFrameBuffer::new(2, 2);
    layer.set_pixel(0, 0, 50, 50, 50, 255);

    // Add (加算)
    let mut b_add = base.clone();
    b_add.composite_layer(&layer, 0, 0, &DrawMethod::Add);
    assert_eq!(b_add.get_pixel(0, 0), Some((150, 150, 150, 255)));

    // Sub (減算)
    let mut b_sub = base.clone();
    b_sub.composite_layer(&layer, 0, 0, &DrawMethod::Blend("sub".into()));
    assert_eq!(b_sub.get_pixel(0, 0), Some((50, 50, 50, 255)));

    // Multiply (乗算)
    let mut b_mul = base.clone();
    b_mul.composite_layer(&layer, 0, 0, &DrawMethod::Blend("multiply".into()));
    // (100 * 50) / 255 = 19
    let p_mul = b_mul.get_pixel(0, 0).unwrap();
    assert!(p_mul.0 < 50);

    // Screen (スクリーン)
    let mut b_scr = base.clone();
    b_scr.composite_layer(&layer, 0, 0, &DrawMethod::Blend("screen".into()));
    let p_scr = b_scr.get_pixel(0, 0).unwrap();
    assert!(p_scr.0 > 100);
}

#[test]
fn test_compositor_blend_modes_and_bounds() {
    let mut base = SurfaceFrameBuffer::new(4, 4);
    for y in 0..4 {
        for x in 0..4 {
            base.set_pixel(x, y, 100, 100, 100, 255);
        }
    }

    let mut layer = SurfaceFrameBuffer::new(2, 2);
    layer.set_pixel(0, 0, 50, 50, 50, 255);
    layer.set_pixel(1, 0, 150, 150, 150, 255);
    layer.set_pixel(0, 1, 200, 200, 200, 255);
    layer.set_pixel(1, 1, 0, 0, 0, 0);

    // Add
    let mut b_add = base.clone();
    b_add.composite_layer(&layer, 1, 1, &DrawMethod::Add);
    assert_eq!(b_add.get_pixel(1, 1), Some((150, 150, 150, 255)));

    // Sub
    let mut b_sub = base.clone();
    b_sub.composite_layer(&layer, 1, 1, &DrawMethod::Blend("sub".into()));
    assert_eq!(b_sub.get_pixel(1, 1), Some((50, 50, 50, 255)));

    // Multiply
    let mut b_mul = base.clone();
    b_mul.composite_layer(&layer, 1, 1, &DrawMethod::Blend("multiply".into()));
    assert!(b_mul.get_pixel(1, 1).unwrap().0 < 100);

    // Screen
    let mut b_scr = base.clone();
    b_scr.composite_layer(&layer, 1, 1, &DrawMethod::Blend("screen".into()));
    assert!(b_scr.get_pixel(1, 1).unwrap().0 > 100);

    // Out of bounds compositing check (should not panic)
    base.composite_layer(&layer, -1, -1, &DrawMethod::Overlay);
    base.composite_layer(&layer, 3, 3, &DrawMethod::Overlay);
}

#[test]
fn test_extended_blend_modes_subtract_divide_overlay_softlight() {
    let mut base = SurfaceFrameBuffer::new(2, 2);
    base.set_pixel(0, 0, 100, 100, 100, 255);
    base.set_pixel(1, 0, 200, 200, 200, 255);

    let mut layer = SurfaceFrameBuffer::new(2, 2);
    layer.set_pixel(0, 0, 50, 50, 50, 255);
    layer.set_pixel(1, 0, 100, 100, 100, 255);

    // Subtract
    let mut b_sub = base.clone();
    b_sub.composite_layer(&layer, 0, 0, &DrawMethod::Blend("subtract".into()));
    assert_eq!(b_sub.get_pixel(0, 0), Some((50, 50, 50, 255)));

    // Divide
    let mut b_div = base.clone();
    b_div.composite_layer(&layer, 0, 0, &DrawMethod::Blend("divide".into()));
    let p_div = b_div.get_pixel(0, 0).unwrap();
    assert!(p_div.0 > 100);

    // Overlay (dark base vs light base)
    let mut b_ovr = base.clone();
    b_ovr.composite_layer(&layer, 0, 0, &DrawMethod::Blend("overlay".into()));
    assert_ne!(b_ovr.get_pixel(0, 0), Some((100, 100, 100, 255)));

    // Softlight
    let mut b_soft = base.clone();
    b_soft.composite_layer(&layer, 0, 0, &DrawMethod::Blend("softlight".into()));
    assert_ne!(b_soft.get_pixel(0, 0), Some((100, 100, 100, 255)));
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

#[test]
fn test_hsl_blend_modes_and_dither() {
    let mut base = SurfaceFrameBuffer::new(4, 4);
    for y in 0..4 {
        for x in 0..4 {
            base.set_pixel(x, y, 100, 150, 200, 255);
        }
    }

    let mut layer = SurfaceFrameBuffer::new(4, 4);
    for y in 0..4 {
        for x in 0..4 {
            layer.set_pixel(x, y, 220, 80, 50, 255);
        }
    }

    // Hue blend
    let mut b_hue = base.clone();
    b_hue.composite_layer(&layer, 0, 0, &DrawMethod::Blend("hue-fast".into()));
    let p_hue = b_hue.get_pixel(0, 0).unwrap();
    assert_eq!(p_hue.3, 255);

    // Saturation blend
    let mut b_sat = base.clone();
    b_sat.composite_layer(&layer, 0, 0, &DrawMethod::Blend("saturation-fast".into()));
    let p_sat = b_sat.get_pixel(0, 0).unwrap();
    assert_eq!(p_sat.3, 255);

    // Color blend
    let mut b_col = base.clone();
    b_col.composite_layer(&layer, 0, 0, &DrawMethod::Blend("color-fast".into()));
    let p_col = b_col.get_pixel(0, 0).unwrap();
    assert_eq!(p_col.3, 255);

    // Luminosity blend
    let mut b_lum = base.clone();
    b_lum.composite_layer(&layer, 0, 0, &DrawMethod::Blend("luminosity-fast".into()));
    let p_lum = b_lum.get_pixel(0, 0).unwrap();
    assert_eq!(p_lum.3, 255);

    // Dither blend: semi-transparent layer over base
    let mut dither_layer = SurfaceFrameBuffer::new(4, 4);
    for y in 0..4 {
        for x in 0..4 {
            // Half transparent (alpha 128)
            dither_layer.set_pixel(x, y, 255, 255, 255, 128);
        }
    }

    let mut b_dither = base.clone();
    b_dither.composite_layer(&dither_layer, 0, 0, &DrawMethod::Blend("dither".into()));

    // In a 4x4 Bayer matrix with alpha 128, exactly half of the pixels exceed the threshold
    let mut over_threshold_count = 0;
    for y in 0..4 {
        for x in 0..4 {
            let p = b_dither.get_pixel(x, y).unwrap();
            if p == (255, 255, 255, 255) {
                over_threshold_count += 1;
            } else {
                assert_eq!(p, (100, 150, 200, 255));
            }
        }
    }
    assert_eq!(over_threshold_count, 8);
}
