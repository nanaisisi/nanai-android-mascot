/**
 * @file framebuffer_mask.rs
 * @brief SurfaceFrameBuffer 生成・範囲・クロマキー・PNAアルファマスク操作単体テスト
 */

use super::*;

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
fn test_chromakey_edge_cases() {
    let mut fb_zero = SurfaceFrameBuffer::new(0, 0);
    fb_zero.apply_corner_chromakey();

    let mut fb_custom = SurfaceFrameBuffer::new(1, 1);
    fb_custom.set_pixel(0, 0, 100, 150, 200, 255);
    fb_custom.apply_chromakey(100, 150, 200);
    assert_eq!(fb_custom.get_pixel(0, 0).unwrap().3, 0);
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
fn test_clear_and_clear_rect() {
    let mut fb = SurfaceFrameBuffer::new(4, 4);
    for y in 0..4 {
        for x in 0..4 {
            fb.set_pixel(x, y, 255, 255, 255, 255);
        }
    }

    // (1, 1) から 2x2 領域をクリア
    fb.clear_rect(1, 1, 2, 2);

    assert_eq!(fb.get_pixel(0, 0), Some((255, 255, 255, 255)));
    assert_eq!(fb.get_pixel(1, 1), Some((0, 0, 0, 0)));
    assert_eq!(fb.get_pixel(2, 2), Some((0, 0, 0, 0)));
    assert_eq!(fb.get_pixel(3, 3), Some((255, 255, 255, 255)));

    // 全体クリア
    fb.clear();
    assert_eq!(fb.get_pixel(0, 0), Some((0, 0, 0, 0)));
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
