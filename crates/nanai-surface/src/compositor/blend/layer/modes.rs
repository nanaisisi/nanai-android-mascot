//! 各種ブレンドモード（分離可能・非分離可能ブレンドモード）の画素演算モジュール

use super::w3c_hsl::{
    Blend_colorParams, Blend_hueParams, Blend_luminosityParams, Blend_saturationParams,
    blend_color, blend_hue, blend_luminosity, blend_saturation,
};

#[allow(non_camel_case_types)]
pub struct Evaluate_blend_modeParams<'a> {
    pub(crate) mode: &'a str,
    pub(crate) dr: u8,
    pub(crate) dg: u8,
    pub(crate) db: u8,
    pub(crate) sr: u8,
    pub(crate) sg: u8,
    pub(crate) sb: u8,
}

#[allow(dead_code)]
impl<'a> Evaluate_blend_modeParams<'a> {
    // Add getter methods
    pub fn mode(&self) -> &'a str {
        self.mode
    }
    pub fn dr(&self) -> u8 {
        self.dr
    }
    pub fn dg(&self) -> u8 {
        self.dg
    }
    pub fn db(&self) -> u8 {
        self.db
    }
    pub fn sr(&self) -> u8 {
        self.sr
    }
    pub fn sg(&self) -> u8 {
        self.sg
    }
    pub fn sb(&self) -> u8 {
        self.sb
    }
}

/// 各種ブレンドモード（mode）に従い、(dr, dg, db) と (sr, sg, sb) を合成計算する
pub(crate) fn evaluate_blend_mode(params: Evaluate_blend_modeParams<'_>) -> (u8, u8, u8) {
    let mode = params.mode();
    let dr = params.dr();
    let dg = params.dg();
    let db = params.db();
    let sr = params.sr();
    let sg = params.sg();
    let sb = params.sb();

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
        "add" | "lighter" | "add-glow" => (
            (sr as u16 + dr as u16).min(255) as u8,
            (sg as u16 + dg as u16).min(255) as u8,
            (sb as u16 + db as u16).min(255) as u8,
        ),
        "overlay" => (
            if dr < 128 {
                ((2 * sr as u16 * dr as u16) / 255) as u8
            } else {
                (255 - (2 * (255 - sr as u16) * (255 - dr as u16) / 255)) as u8
            },
            if dg < 128 {
                ((2 * sg as u16 * dg as u16) / 255) as u8
            } else {
                (255 - (2 * (255 - sg as u16) * (255 - dg as u16) / 255)) as u8
            },
            if db < 128 {
                ((2 * sb as u16 * db as u16) / 255) as u8
            } else {
                (255 - (2 * (255 - sb as u16) * (255 - db as u16) / 255)) as u8
            },
        ),
        "darken" => (
            std::cmp::min(sr, dr),
            std::cmp::min(sg, dg),
            std::cmp::min(sb, db),
        ),
        "darker-color" => {
            let lum_src = (sr as u32 * 299 + sg as u32 * 587 + sb as u32 * 114) / 1000;
            let lum_dst = (dr as u32 * 299 + dg as u32 * 587 + db as u32 * 114) / 1000;
            if lum_src < lum_dst {
                (sr, sg, sb)
            } else {
                (dr, dg, db)
            }
        }
        "lighten" => (
            std::cmp::max(sr, dr),
            std::cmp::max(sg, dg),
            std::cmp::max(sb, db),
        ),
        "lighter-color" => {
            let lum_src = (sr as u32 * 299 + sg as u32 * 587 + sb as u32 * 114) / 1000;
            let lum_dst = (dr as u32 * 299 + dg as u32 * 587 + db as u32 * 114) / 1000;
            if lum_src > lum_dst {
                (sr, sg, sb)
            } else {
                (dr, dg, db)
            }
        }
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
        "colordodge" | "color-dodge" | "color-dodge-glow" => (
            if dr == 0 {
                0
            } else if sr == 255 {
                255
            } else {
                std::cmp::min(255, ((dr as u32 * 255) / (255 - sr as u32)) as u8)
            },
            if dg == 0 {
                0
            } else if sg == 255 {
                255
            } else {
                std::cmp::min(255, ((dg as u32 * 255) / (255 - sg as u32)) as u8)
            },
            if db == 0 {
                0
            } else if sb == 255 {
                255
            } else {
                std::cmp::min(255, ((db as u32 * 255) / (255 - sb as u32)) as u8)
            },
        ),
        "colorburn" | "color-burn" => (
            if dr == 255 {
                255
            } else if sr == 0 {
                0
            } else {
                255 - std::cmp::min(255, (((255 - dr as u32) * 255) / sr as u32) as u8)
            },
            if dg == 255 {
                255
            } else if sg == 0 {
                0
            } else {
                255 - std::cmp::min(255, (((255 - dg as u32) * 255) / sg as u32) as u8)
            },
            if db == 255 {
                255
            } else if sb == 0 {
                0
            } else {
                255 - std::cmp::min(255, (((255 - db as u32) * 255) / sb as u32) as u8)
            },
        ),
        "hardlight" | "hard-light" => (
            if sr < 128 {
                ((2 * sr as u16 * dr as u16) / 255) as u8
            } else {
                (255 - (2 * (255 - sr as u16) * (255 - dr as u16) / 255)) as u8
            },
            if sg < 128 {
                ((2 * sg as u16 * dg as u16) / 255) as u8
            } else {
                (255 - (2 * (255 - sg as u16) * (255 - dg as u16) / 255)) as u8
            },
            if sb < 128 {
                ((2 * sb as u16 * db as u16) / 255) as u8
            } else {
                (255 - (2 * (255 - sb as u16) * (255 - db as u16) / 255)) as u8
            },
        ),
        "softlight" | "soft-light" => {
            // SVG 1.1 / W3C Compositing and Blending softlight formula
            let f = |d: u8, s: u8| -> u8 {
                let dc = d as f32 / 255.0;
                let sc = s as f32 / 255.0;
                let res = if sc <= 0.5 {
                    dc - (1.0 - 2.0 * sc) * dc * (1.0 - dc)
                } else {
                    let d_c = if dc <= 0.25 {
                        ((16.0 * dc - 12.0) * dc + 4.0) * dc
                    } else {
                        dc.sqrt()
                    };
                    dc + (2.0 * sc - 1.0) * (d_c - dc)
                };
                (res * 255.0).clamp(0.0, 255.0) as u8
            };
            (f(dr, sr), f(dg, sg), f(db, sb))
        }
        "difference" => (
            (dr as i16 - sr as i16).unsigned_abs() as u8,
            (dg as i16 - sg as i16).unsigned_abs() as u8,
            (db as i16 - sb as i16).unsigned_abs() as u8,
        ),
        "exclusion" => (
            (dr as u16 + sr as u16 - (2 * dr as u16 * sr as u16) / 255) as u8,
            (dg as u16 + sg as u16 - (2 * dg as u16 * sg as u16) / 255) as u8,
            (db as u16 + sb as u16 - (2 * db as u16 * sb as u16) / 255) as u8,
        ),
        "hue" => blend_hue(Blend_hueParams {
            dr,
            dg,
            db,
            sr,
            sg,
            sb,
        }),
        "saturation" => blend_saturation(Blend_saturationParams {
            dr,
            dg,
            db,
            sr,
            sg,
            sb,
        }),
        "color" => blend_color(Blend_colorParams {
            dr,
            dg,
            db,
            sr,
            sg,
            sb,
        }),
        "luminosity" => blend_luminosity(Blend_luminosityParams {
            dr,
            dg,
            db,
            sr,
            sg,
            sb,
        }),
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
                } else if d == 0 {
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
            };
            (calc(dr, sr), calc(dg, sg), calc(db, sb))
        }
        "linear-burn" => (
            (dr as i32 + sr as i32 - 255).max(0) as u8,
            (dg as i32 + sg as i32 - 255).max(0) as u8,
            (db as i32 + sb as i32 - 255).max(0) as u8,
        ),
        "linear-light" => (
            (dr as i32 + 2 * (sr as i32) - 255).clamp(0, 255) as u8,
            (dg as i32 + 2 * (sg as i32) - 255).clamp(0, 255) as u8,
            (db as i32 + 2 * (sb as i32) - 255).clamp(0, 255) as u8,
        ),
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
        "dither" => (sr, sg, sb),
        _ => (sr, sg, sb), // fallback to normal/source
    }
}
