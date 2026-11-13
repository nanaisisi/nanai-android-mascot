//! サーフィス画像コンポジタのユニットテスト

mod blend_modes;
mod framebuffer_mask;
mod layer_compositing;

use super::{SurfaceFrameBuffer, composite_elements};
use crate::types::DrawMethod;
