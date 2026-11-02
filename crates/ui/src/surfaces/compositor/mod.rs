//! サーフィス画像コンポジタ (ukadoc-spec / shell-surfaces 準拠)
//!
//! PNA アルファマスク合成、左上 1px または純緑クロマキー透過、
//! および各種レイヤーブレンド合成（Base, Overlay, OverlayFast, Replace, Blend等）を行うフレームバッファ。

pub mod framebuffer;
pub mod blend;
pub mod element;

#[cfg(test)]
pub mod tests;

pub use framebuffer::SurfaceFrameBuffer;
pub use element::composite_elements;
