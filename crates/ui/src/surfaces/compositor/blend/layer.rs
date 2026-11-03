//! レイヤー合成処理

use crate::surfaces::compositor::framebuffer::SurfaceFrameBuffer;
use crate::surfaces::types::DrawMethod;

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

                        let (br, bg, bb) = match mode {
                            "multiply" => (
                                ((sr as u16 * dr as u16) / 255) as u8,
                                ((sg as u16 * dg as u16) / 255) as u8,
                                ((sb as u16 * db as u16) / 255) as u8,
                            ),
                            "screen" => (
                                (255 - ((255 - sr as u16) * (255 - dr as u16) / 255)) as u8,
                                (255 - ((255 - sg as u16) * (255 - dg as u16) / 255)) as u8,
                                (255 - ((255 - sb as u16) * (255 - db as u16) / 255)) as u8,
                            ),
                            "add" | "lighter" => (
                                (sr as u16 + dr as u16).min(255) as u8,
                                (sg as u16 + dg as u16).min(255) as u8,
                                (sb as u16 + db as u16).min(255) as u8,
                            ),
                            "darken" => (sr.min(dr), sg.min(dg), sb.min(db)),
                            "lighten" => (sr.max(dr), sg.max(dg), sb.max(db)),
                            "difference" => (
                                (sr as i16 - dr as i16).unsigned_abs() as u8,
                                (sg as i16 - dg as i16).unsigned_abs() as u8,
                                (sb as i16 - db as i16).unsigned_abs() as u8,
                            ),
                            "exclusion" => (
                                (dr as i32 + sr as i32 - 2 * (dr as i32 * sr as i32) / 255)
                                    .clamp(0, 255) as u8,
                                (dg as i32 + sg as i32 - 2 * (dg as i32 * sg as i32) / 255)
                                    .clamp(0, 255) as u8,
                                (db as i32 + sb as i32 - 2 * (db as i32 * sb as i32) / 255)
                                    .clamp(0, 255) as u8,
                            ),
                            "subtract" => (
                                (dr as i16 - sr as i16).max(0) as u8,
                                (dg as i16 - sg as i16).max(0) as u8,
                                (db as i16 - sb as i16).max(0) as u8,
                            ),
                            "divide" => (
                                if sr == 0 {
                                    255
                                } else {
                                    (((dr as u32) * 255) / (sr as u32)).min(255) as u8
                                },
                                if sg == 0 {
                                    255
                                } else {
                                    (((dg as u32) * 255) / (sg as u32)).min(255) as u8
                                },
                                if sb == 0 {
                                    255
                                } else {
                                    (((db as u32) * 255) / (sb as u32)).min(255) as u8
                                },
                            ),
                            "overlay" => {
                                let calc = |d: u8, s: u8| -> u8 {
                                    if d < 128 {
                                        ((2 * (d as u32) * (s as u32)) / 255).min(255) as u8
                                    } else {
                                        (255 - (2 * (255 - d as u32) * (255 - s as u32)) / 255)
                                            .min(255) as u8
                                    }
                                };
                                (calc(dr, sr), calc(dg, sg), calc(db, sb))
                            }
                            "softlight" | "soft-light" => {
                                let calc = |d: u8, s: u8| -> u8 {
                                    let d_f = d as f32 / 255.0;
                                    let s_f = s as f32 / 255.0;
                                    let res = if s_f < 0.5 {
                                        d_f - (1.0 - 2.0 * s_f) * d_f * (1.0 - d_f)
                                    } else {
                                        let d_sqrt = d_f.sqrt();
                                        d_f + (2.0 * s_f - 1.0) * (d_sqrt - d_f)
                                    };
                                    (res * 255.0).clamp(0.0, 255.0).round() as u8
                                };
                                (calc(dr, sr), calc(dg, sg), calc(db, sb))
                            }
                            _ => (sr, sg, sb),
                        };

                        // 一般アルファ合成（-fast 指定時はダイレクト代入）
                        if is_fast {
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
