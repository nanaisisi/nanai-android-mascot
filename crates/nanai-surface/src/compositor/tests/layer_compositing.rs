/**
 * @file layer_compositing.rs
 * @brief レイヤー合成（Overlay, Replace, Interpolate, Reduce, FastBlend）単体テスト
 */
use super::*;

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
    // Replace(0,0)は透明(0,0,0,0)で直接上書きされること
    assert_eq!(replaced.get_pixel(0, 0), Some((0, 0, 0, 0)));
}

#[test]
fn test_interpolate_compositing() {
    let mut base = SurfaceFrameBuffer::new(2, 2);
    base.set_pixel(0, 0, 100, 100, 100, 255);
    base.set_pixel(1, 0, 100, 100, 100, 255);

    let mut layer = SurfaceFrameBuffer::new(2, 2);
    // 半透明の赤
    layer.set_pixel(0, 0, 200, 0, 0, 128);

    base.composite_layer(&layer, 0, 0, &DrawMethod::Interpolate);

    // 補間（Alpha 128 によるブレンディング）結果の検証
    let p = base.get_pixel(0, 0).unwrap();
    assert!(p.0 > 100); // 赤味が増加
    assert!(p.1 < 100); // 緑味が減少
}

#[test]
fn test_reduce_and_fast_blend_compositing() {
    let mut base = SurfaceFrameBuffer::new(2, 2);
    base.set_pixel(0, 0, 100, 100, 100, 255);

    let mut layer = SurfaceFrameBuffer::new(2, 2);
    layer.set_pixel(0, 0, 200, 200, 200, 255);

    // Reduce 合成 (アルファ減算)
    let mut base_reduce = base.clone();
    let mut layer_reduce = SurfaceFrameBuffer::new(1, 1);
    layer_reduce.set_pixel(0, 0, 50, 50, 50, 100);
    base_reduce.composite_layer(&layer_reduce, 0, 0, &DrawMethod::Reduce);
    assert_eq!(base_reduce.get_pixel(0, 0).unwrap().3, 100);

    // FastBlend モード検証
    let mut base_fast = base.clone();
    base_fast.composite_layer(&layer, 0, 0, &DrawMethod::Blend("add-fast".into()));
    assert_eq!(base_fast.get_pixel(0, 0), Some((255, 255, 255, 255)));

    let mut base_sub = base.clone();
    base_sub.composite_layer(&layer, 0, 0, &DrawMethod::Blend("sub-fast".into()));
    assert_eq!(base_sub.get_pixel(0, 0), Some((0, 0, 0, 255)));
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
