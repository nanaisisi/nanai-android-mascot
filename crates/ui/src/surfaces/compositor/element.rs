//! サーフィス画像コンポジタ - 要素（レイヤー群）一括合成関数

use super::framebuffer::SurfaceFrameBuffer;
use super::super::types::DrawMethod;

/// 複数のレイヤー定義に従い、ベースフレームバッファ上に一括合成する
pub fn composite_elements(
    base: &SurfaceFrameBuffer,
    layers: &[(&SurfaceFrameBuffer, i32, i32, DrawMethod)],
) -> SurfaceFrameBuffer {
    let mut out = base.clone();
    for (layer, x, y, method) in layers {
        out.composite_layer(layer, *x, *y, method);
    }
    out
}
