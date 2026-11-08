//! レイヤー合成処理

use crate::surfaces::compositor::framebuffer::SurfaceFrameBuffer;
use crate::surfaces::types::DrawMethod;

// 4x4 Bayer Dither Matrix (values 0..15 normalized to 0..255)
const BAYER_MATRIX_4X4: [u8; 16] = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

/// W3C Compositing and Blending Level 1: Luminosity calculation
#[inline]
fn lum(r: f32, g: f32, b: f32) -> f32 {
    0.3 * r + 0.59 * g + 0.11 * b
}

/// W3C Compositing and Blending Level 1: Clip color within [0.0, 1.0]
#[inline]
fn clip_color(mut r: f32, mut g: f32, mut b: f32) -> (f32, f32, f32) {
    let l = lum(r, g, b);
    let n = r.min(g).min(b);
    let x = r.max(g).max(b);

    if n < 0.0 && (l - n).abs() > 1e-6 {
        r = l + (((r - l) * l) / (l - n));
        g = l + (((g - l) * l) / (l - n));
        b = l + (((b - l) * l) / (l - n));
    }
    if x > 1.0 && (x - l).abs() > 1e-6 {
        r = l + (((r - l) * (1.0 - l)) / (x - l));
        g = l + (((g - l) * (1.0 - l)) / (x - l));
        b = l + (((b - l) * (1.0 - l)) / (x - l));
    }
    (r.clamp(0.0, 1.0), g.clamp(0.0, 1.0), b.clamp(0.0, 1.0))
}

/// W3C Compositing and Blending Level 1: Set luminosity
#[inline]
fn set_lum(r: f32, g: f32, b: f32, l: f32) -> (f32, f32, f32) {
    let d = l - lum(r, g, b);
    clip_color(r + d, g + d, b + d)
}

/// W3C Compositing and Blending Level 1: Saturation calculation
#[inline]
fn sat(r: f32, g: f32, b: f32) -> f32 {
    r.max(g).max(b) - r.min(g).min(b)
}

/// W3C Compositing and Blending Level 1: Set saturation
fn set_sat(r: f32, g: f32, b: f32, s: f32) -> (f32, f32, f32) {
    let mut colors = [(r, 0usize), (g, 1usize), (b, 2usize)];
    colors.sort_by(|a, b| a.0.partial_cmp(&b.0).unwrap_or(std::cmp::Ordering::Equal));

    let c_min = colors[0].0;
    let c_mid = colors[1].0;
    let c_max = colors[2].0;

    if c_max > c_min {
        let new_mid = (((c_mid - c_min) * s) / (c_max - c_min)).clamp(0.0, 1.0);
        let new_max = s.clamp(0.0, 1.0);
        let new_min = 0.0;

        let mut res = [0.0f32; 3];
        res[colors[0].1] = new_min;
        res[colors[1].1] = new_mid;
        res[colors[2].1] = new_max;
        (res[0], res[1], res[2])
    } else {
        (0.0, 0.0, 0.0)
    }
}

/// Non-separable blend mode helpers (input 0..255, returns 0..255)
fn blend_hue(dr: u8, dg: u8, db: u8, sr: u8, sg: u8, sb: u8) -> (u8, u8, u8) {
    let (d_r, d_g, d_b) = (dr as f32 / 255.0, dg as f32 / 255.0, db as f32 / 255.0);
    let (s_r, s_g, s_b) = (sr as f32 / 255.0, sg as f32 / 255.0, sb as f32 / 255.0);
    let (r1, g1, b1) = set_sat(s_r, s_g, s_b, sat(d_r, d_g, d_b));
    let (r2, g2, b2) = set_lum(r1, g1, b1, lum(d_r, d_g, d_b));
    (
        (r2 * 255.0).round().clamp(0.0, 255.0) as u8,
        (g2 * 255.0).round().clamp(0.0, 255.0) as u8,
        (b2 * 255.0).round().clamp(0.0, 255.0) as u8,
    )
}

fn blend_saturation(dr: u8, dg: u8, db: u8, sr: u8, sg: u8, sb: u8) -> (u8, u8, u8) {
    let (d_r, d_g, d_b) = (dr as f32 / 255.0, dg as f32 / 255.0, db as f32 / 255.0);
    let (s_r, s_g, s_b) = (sr as f32 / 255.0, sg as f32 / 255.0, sb as f32 / 255.0);
    let (r1, g1, b1) = set_sat(d_r, d_g, d_b, sat(s_r, s_g, s_b));
    let (r2, g2, b2) = set_lum(r1, g1, b1, lum(d_r, d_g, d_b));
    (
        (r2 * 255.0).round().clamp(0.0, 255.0) as u8,
        (g2 * 255.0).round().clamp(0.0, 255.0) as u8,
        (b2 * 255.0).round().clamp(0.0, 255.0) as u8,
    )
}

fn blend_color(dr: u8, dg: u8, db: u8, sr: u8, sg: u8, sb: u8) -> (u8, u8, u8) {
    let (d_r, d_g, d_b) = (dr as f32 / 255.0, dg as f32 / 255.0, db as f32 / 255.0);
    let (s_r, s_g, s_b) = (sr as f32 / 255.0, sg as f32 / 255.0, sb as f32 / 255.0);
    let (r, g, b) = set_lum(s_r, s_g, s_b, lum(d_r, d_g, d_b));
    (
        (r * 255.0).round().clamp(0.0, 255.0) as u8,
        (g * 255.0).round().clamp(0.0, 255.0) as u8,
        (b * 255.0).round().clamp(0.0, 255.0) as u8,
    )
}

fn blend_luminosity(dr: u8, dg: u8, db: u8, sr: u8, sg: u8, sb: u8) -> (u8, u8, u8) {
    let (d_r, d_g, d_b) = (dr as f32 / 255.0, dg as f32 / 255.0, db as f32 / 255.0);
    let (s_r, s_g, s_b) = (sr as f32 / 255.0, sg as f32 / 255.0, sb as f32 / 255.0);
    let (r, g, b) = set_lum(d_r, d_g, d_b, lum(s_r, s_g, s_b));
    (
        (r * 255.0).round().clamp(0.0, 255.0) as u8,
        (g * 255.0).round().clamp(0.0, 255.0) as u8,
        (b * 255.0).round().clamp(0.0, 255.0) as u8,
    )
}

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
                            "add-glow" => {
                                // 加算(発光): 加算結果をクランプ
                                (
                                    (sr as u16 + dr as u16).min(255) as u8,
                                    (sg as u16 + dg as u16).min(255) as u8,
                                    (sb as u16 + db as u16).min(255) as u8,
                                )
                            }
                            "darken" => (sr.min(dr), sg.min(dg), sb.min(db)),
                            "darker-color" => {
                                // Darker Color (カラーが暗い方): 輝度/合成値が低い方のピクセル全体を選択
                                let lum_src =
                                    (sr as u32 * 299 + sg as u32 * 587 + sb as u32 * 114) / 1000;
                                let lum_dst =
                                    (dr as u32 * 299 + dg as u32 * 587 + db as u32 * 114) / 1000;
                                if lum_src < lum_dst {
                                    (sr, sg, sb)
                                } else {
                                    (dr, dg, db)
                                }
                            }
                            "lighten" => (sr.max(dr), sg.max(dg), sb.max(db)),
                            "lighter-color" => {
                                // Lighter Color (カラーが明るい方): 輝度/合成値が高い方のピクセル全体を選択
                                let lum_src =
                                    (sr as u32 * 299 + sg as u32 * 587 + sb as u32 * 114) / 1000;
                                let lum_dst =
                                    (dr as u32 * 299 + dg as u32 * 587 + db as u32 * 114) / 1000;
                                if lum_src > lum_dst {
                                    (sr, sg, sb)
                                } else {
                                    (dr, dg, db)
                                }
                            }
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
                            "color-dodge" | "color-dodge-glow" => {
                                let calc = |d: u8, s: u8| -> u8 {
                                    if d == 0 {
                                        0
                                    } else if s == 255 {
                                        255
                                    } else {
                                        (((d as u32) * 255) / (255 - s as u32)).min(255) as u8
                                    }
                                };
                                (calc(dr, sr), calc(dg, sg), calc(db, sb))
                            }
                            "color-burn" => {
                                let calc = |d: u8, s: u8| -> u8 {
                                    if d == 255 {
                                        255
                                    } else if s == 0 {
                                        0
                                    } else {
                                        let inv_d = 255 - d as i32;
                                        (255 - (inv_d * 255) / (s as i32)).clamp(0, 255) as u8
                                    }
                                };
                                (calc(dr, sr), calc(dg, sg), calc(db, sb))
                            }
                            "hard-light" => {
                                let calc = |d: u8, s: u8| -> u8 {
                                    if s < 128 {
                                        ((2 * (s as u32) * (d as u32)) / 255).min(255) as u8
                                    } else {
                                        (255 - (2 * (255 - s as u32) * (255 - d as u32)) / 255)
                                            .min(255) as u8
                                    }
                                };
                                (calc(dr, sr), calc(dg, sg), calc(db, sb))
                            }
                            "vivid-light" => {
                                let calc = |d: u8, s: u8| -> u8 {
                                    if s < 128 {
                                        // color-burn with 2*s
                                        if d == 255 {
                                            255
                                        } else if s == 0 {
                                            0
                                        } else {
                                            let s2 = (s as i32) * 2;
                                            let inv_d = 255 - d as i32;
                                            (255 - (inv_d * 255) / s2).clamp(0, 255) as u8
                                        }
                                    } else {
                                        // color-dodge with 2*(s - 128)
                                        if d == 0 {
                                            0
                                        } else if s == 255 {
                                            255
                                        } else {
                                            let s_val = 2 * (s as u32 - 128);
                                            if s_val >= 255 {
                                                255
                                            } else {
                                                (((d as u32) * 255) / (255 - s_val)).min(255) as u8
                                            }
                                        }
                                    }
                                };
                                (calc(dr, sr), calc(dg, sg), calc(db, sb))
                            }
                            "linear-burn" => {
                                let calc = |d: u8, s: u8| -> u8 {
                                    (d as i32 + s as i32 - 255).max(0) as u8
                                };
                                (calc(dr, sr), calc(dg, sg), calc(db, sb))
                            }
                            "linear-light" => {
                                let calc = |d: u8, s: u8| -> u8 {
                                    (d as i32 + 2 * (s as i32) - 255).clamp(0, 255) as u8
                                };
                                (calc(dr, sr), calc(dg, sg), calc(db, sb))
                            }
                            "pin-light" => {
                                let calc = |d: u8, s: u8| -> u8 {
                                    if s < 128 {
                                        d.min(2 * s)
                                    } else {
                                        let s2 = 2 * (s as u16 - 128);
                                        (d as u16).max(s2).min(255) as u8
                                    }
                                };
                                (calc(dr, sr), calc(dg, sg), calc(db, sb))
                            }
                            "hard-mix" => {
                                let calc = |d: u8, s: u8| -> u8 {
                                    let linear_light = d as i32 + 2 * (s as i32) - 255;
                                    if linear_light >= 128 { 255 } else { 0 }
                                };
                                (calc(dr, sr), calc(dg, sg), calc(db, sb))
                            }
                            "hue" => blend_hue(dr, dg, db, sr, sg, sb),
                            "saturation" => blend_saturation(dr, dg, db, sr, sg, sb),
                            "color" => blend_color(dr, dg, db, sr, sg, sb),
                            "luminosity" => blend_luminosity(dr, dg, db, sr, sg, sb),
                            "dither" => (sr, sg, sb),
                            _ => (sr, sg, sb),
                        };

                        if mode == "dither" {
                            // 4x4 オーダーディザマトリクスによるアルファディザリング (Bayer Matrix normalized threshold)
                            let bayer_val =
                                BAYER_MATRIX_4X4[((ty as usize & 3) << 2) | (tx as usize & 3)];
                            let threshold = (((bayer_val as u32 * 2 + 1) * 255) / 32) as u8;
                            if sa > threshold {
                                self.data[dst_idx] = sr;
                                self.data[dst_idx + 1] = sg;
                                self.data[dst_idx + 2] = sb;
                                self.data[dst_idx + 3] = 255;
                            }
                            // 閾値以下の場合はベースのまま保持
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
