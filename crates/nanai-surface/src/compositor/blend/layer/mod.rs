//! レイヤー合成処理（UKADOC spec / shell-surfaces 準拠）

pub mod modes;
pub mod w3c_hsl;

use crate::compositor::framebuffer::SurfaceFrameBuffer;
use crate::types::DrawMethod;
use modes::evaluate_blend_mode;

// 4x4 Bayer Dither Matrix (values 0..15 normalized to 0..255)
const BAYER_MATRIX_4X4: [u8; 16] = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

impl SurfaceFrameBuffer {
    /// 別のフレームバッファをレイヤーとして指定座標 (dx, dy) に合成する
    pub fn composite_layer(
        &mut self,
        layer: &SurfaceFrameBuffer,
        dx: i32,
        dy: i32,
        method: &DrawMethod,
    ) {
        for ly in 0..layer.height {
            let ty = dy + ly as i32;
            if ty < 0 || ty >= self.height as i32 {
                continue;
            }
            for lx in 0..layer.width {
                let tx = dx + lx as i32;
                if tx < 0 || tx >= self.width as i32 {
                    continue;
                }

                let (sr, sg, sb, sa) = layer.get_pixel(lx, ly).unwrap();
                let dst_idx = ((ty as usize) * (self.width as usize) + (tx as usize)) * 4;

                match method {
                    DrawMethod::Replace | DrawMethod::OverlayFast => {
                        // 対象領域を完全に上書き
                        self.data[dst_idx] = sr;
                        self.data[dst_idx + 1] = sg;
                        self.data[dst_idx + 2] = sb;
                        self.data[dst_idx + 3] = sa;
                    }
                    DrawMethod::AsIs => {
                        // アルファブレンドせずそのまま上書き
                        self.data[dst_idx] = sr;
                        self.data[dst_idx + 1] = sg;
                        self.data[dst_idx + 2] = sb;
                        self.data[dst_idx + 3] = sa;
                    }
                    DrawMethod::Interpolate => {
                        // 下の絵と同一色の部分を透過して重ねる (UKADOC準拠)
                        let dr = self.data[dst_idx];
                        let dg = self.data[dst_idx + 1];
                        let db = self.data[dst_idx + 2];
                        let da = self.data[dst_idx + 3];

                        if sa == 0 || (sr == dr && sg == dg && sb == db) {
                            continue;
                        }

                        let alpha = sa as f32 / 255.0;
                        let inv_alpha = 1.0 - alpha;
                        self.data[dst_idx] = (sr as f32 * alpha + dr as f32 * inv_alpha) as u8;
                        self.data[dst_idx + 1] = (sg as f32 * alpha + dg as f32 * inv_alpha) as u8;
                        self.data[dst_idx + 2] = (sb as f32 * alpha + db as f32 * inv_alpha) as u8;
                        self.data[dst_idx + 3] =
                            (sa as f32 + da as f32 * inv_alpha).min(255.0) as u8;
                    }
                    DrawMethod::Reduce => {
                        // reduce: ベースレイヤと新規レイヤの不透明度（アルファ）を乗算 (UKADOC準拠)
                        // RGB値はベースレイヤのまま保持し、アルファのみ乗算更新
                        let da = self.data[dst_idx + 3];
                        let out_a = ((da as u16 * sa as u16 + 127) / 255) as u8;
                        self.data[dst_idx + 3] = out_a;
                    }
                    DrawMethod::Add => {
                        // Add 加算合成
                        let dr = self.data[dst_idx];
                        let dg = self.data[dst_idx + 1];
                        let db = self.data[dst_idx + 2];
                        let da = self.data[dst_idx + 3];

                        if sa == 0 {
                            continue;
                        }

                        let br = (sr as u16 + dr as u16).min(255) as u8;
                        let bg = (sg as u16 + dg as u16).min(255) as u8;
                        let bb = (sb as u16 + db as u16).min(255) as u8;

                        let alpha = sa as f32 / 255.0;
                        let inv_alpha = 1.0 - alpha;
                        self.data[dst_idx] = (br as f32 * alpha + dr as f32 * inv_alpha) as u8;
                        self.data[dst_idx + 1] = (bg as f32 * alpha + dg as f32 * inv_alpha) as u8;
                        self.data[dst_idx + 2] = (bb as f32 * alpha + db as f32 * inv_alpha) as u8;
                        self.data[dst_idx + 3] =
                            (sa as f32 + da as f32 * inv_alpha).min(255.0) as u8;
                    }
                    DrawMethod::Blend(blend_type) => {
                        // ブレンドモード合成
                        let dr = self.data[dst_idx];
                        let dg = self.data[dst_idx + 1];
                        let db = self.data[dst_idx + 2];
                        let da = self.data[dst_idx + 3];

                        if sa == 0 {
                            continue;
                        }

                        let b_lower = blend_type.to_lowercase();
                        let is_fast = b_lower.ends_with("-fast");
                        let mode = b_lower.trim_end_matches("-fast");

                        let (br, bg, bb) = evaluate_blend_mode(mode, dr, dg, db, sr, sg, sb);

                        if mode == "dither" {
                            // 4x4 オーダーディザマトリクスによるアルファディザリング
                            let bayer_val =
                                BAYER_MATRIX_4X4[((ty as usize & 3) << 2) | (tx as usize & 3)];
                            let threshold = (((bayer_val as u32 * 2 + 1) * 255) / 32) as u8;
                            if sa > threshold {
                                self.data[dst_idx] = sr;
                                self.data[dst_idx + 1] = sg;
                                self.data[dst_idx + 2] = sb;
                                self.data[dst_idx + 3] = 255;
                            }
                        } else if is_fast {
                            // -fast 指定時はダイレクト代入
                            self.data[dst_idx] = br;
                            self.data[dst_idx + 1] = bg;
                            self.data[dst_idx + 2] = bb;
                            self.data[dst_idx + 3] = sa;
                        } else {
                            let alpha = sa as f32 / 255.0;
                            let inv_alpha = 1.0 - alpha;
                            self.data[dst_idx] = (br as f32 * alpha + dr as f32 * inv_alpha) as u8;
                            self.data[dst_idx + 1] =
                                (bg as f32 * alpha + dg as f32 * inv_alpha) as u8;
                            self.data[dst_idx + 2] =
                                (bb as f32 * alpha + db as f32 * inv_alpha) as u8;
                            self.data[dst_idx + 3] =
                                (sa as f32 + da as f32 * inv_alpha).min(255.0) as u8;
                        }
                    }
                    _ => {
                        // 通常の Overlay / Base (標準Porter-Duffアルファ合成)
                        if sa == 0 {
                            continue;
                        }
                        if sa == 255 {
                            self.data[dst_idx] = sr;
                            self.data[dst_idx + 1] = sg;
                            self.data[dst_idx + 2] = sb;
                            self.data[dst_idx + 3] = sa;
                        } else {
                            let dr = self.data[dst_idx];
                            let dg = self.data[dst_idx + 1];
                            let db = self.data[dst_idx + 2];
                            let da = self.data[dst_idx + 3];

                            let alpha = sa as f32 / 255.0;
                            let inv_alpha = 1.0 - alpha;

                            self.data[dst_idx] = (sr as f32 * alpha + dr as f32 * inv_alpha) as u8;
                            self.data[dst_idx + 1] =
                                (sg as f32 * alpha + dg as f32 * inv_alpha) as u8;
                            self.data[dst_idx + 2] =
                                (sb as f32 * alpha + db as f32 * inv_alpha) as u8;
                            self.data[dst_idx + 3] =
                                (sa as f32 + da as f32 * inv_alpha).min(255.0) as u8;
                        }
                    }
                }
            }
        }
    }
}
