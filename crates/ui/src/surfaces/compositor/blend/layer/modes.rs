//! 各種ブレンドモード（分離可能・非分離可能ブレンドモード）の画素演算モジュール

use super::w3c_hsl::{blend_color, blend_hue, blend_luminosity, blend_saturation};

/// 各種ブレンドモード（mode）に従い、(dr, dg, db) と (sr, sg, sb) を合成計算する
pub(crate) fn evaluate_blend_mode(
    mode: &str,
    dr: u8,
    dg: u8,
    db: u8,
    sr: u8,
    sg: u8,
    sb: u8,
) -> (u8, u8, u8) {
    match mode {
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
        "add-glow" => (
            (sr as u16 + dr as u16).min(255) as u8,
            (sg as u16 + dg as u16).min(255) as u8,
            (sb as u16 + db as u16).min(255) as u8,
        ),
        "darken" => (sr.min(dr), sg.min(dg), sb.min(db)),
        "darker-color" => {
            let lum_src = (sr as u32 * 299 + sg as u32 * 587 + sb as u32 * 114) / 1000;
            let lum_dst = (dr as u32 * 299 + dg as u32 * 587 + db as u32 * 114) / 1000;
            if lum_src < lum_dst {
                (sr, sg, sb)
            } else {
                (dr, dg, db)
            }
        }
        "lighten" => (sr.max(dr), sg.max(dg), sb.max(db)),
        "lighter-color" => {
            let lum_src = (sr as u32 * 299 + sg as u32 * 587 + sb as u32 * 114) / 1000;
            let lum_dst = (dr as u32 * 299 + dg as u32 * 587 + db as u32 * 114) / 1000;
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
            (dr as i32 + sr as i32 - 2 * (dr as i32 * sr as i32) / 255).clamp(0, 255) as u8,
            (dg as i32 + sg as i32 - 2 * (dg as i32 * sg as i32) / 255).clamp(0, 255) as u8,
            (db as i32 + sb as i32 - 2 * (db as i32 * sb as i32) / 255).clamp(0, 255) as u8,
        ),
        "subtract" | "sub" => (
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
                    (255 - (2 * (255 - d as u32) * (255 - s as u32)) / 255).min(255) as u8
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
                    (255 - (2 * (255 - s as u32) * (255 - d as u32)) / 255).min(255) as u8
                }
            };
            (calc(dr, sr), calc(dg, sg), calc(db, sb))
        }
        "vivid-light" => {
            let calc = |d: u8, s: u8| -> u8 {
                if s < 128 {
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
            let calc = |d: u8, s: u8| -> u8 { (d as i32 + s as i32 - 255).max(0) as u8 };
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
                if linear_light >= 128 {
                    255
                } else {
                    0
                }
            };
            (calc(dr, sr), calc(dg, sg), calc(db, sb))
        }
        "hue" => blend_hue(dr, dg, db, sr, sg, sb),
        "saturation" => blend_saturation(dr, dg, db, sr, sg, sb),
        "color" => blend_color(dr, dg, db, sr, sg, sb),
        "luminosity" => blend_luminosity(dr, dg, db, sr, sg, sb),
        "dither" => (sr, sg, sb),
        _ => (sr, sg, sb),
    }
}
