//! W3C HSL (Hue, Saturation, Color, Luminosity) レイヤー演算ブレンドモード

use super::helpers::{
    LumParams, SatParams, Set_lumParams, Set_satParams, lum, sat, set_lum, set_sat,
};

#[allow(non_camel_case_types)]
pub struct Blend_hueParams {
    pub(crate) dr: u8,
    pub(crate) dg: u8,
    pub(crate) db: u8,
    pub(crate) sr: u8,
    pub(crate) sg: u8,
    pub(crate) sb: u8,
}

#[allow(dead_code)]
impl Blend_hueParams {
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

pub(crate) fn blend_hue(params: Blend_hueParams) -> (u8, u8, u8) {
    let dr = params.dr();
    let dg = params.dg();
    let db = params.db();
    let sr = params.sr();
    let sg = params.sg();
    let sb = params.sb();
    let (d_r, d_g, d_b) = (dr as f32 / 255.0, dg as f32 / 255.0, db as f32 / 255.0);
    let (s_r, s_g, s_b) = (sr as f32 / 255.0, sg as f32 / 255.0, sb as f32 / 255.0);
    let (r1, g1, b1) = set_sat(Set_satParams {
        r: s_r,
        g: s_g,
        b: s_b,
        s: sat(SatParams {
            r: d_r,
            g: d_g,
            b: d_b,
        }),
    });
    let (r2, g2, b2) = set_lum(Set_lumParams {
        r: r1,
        g: g1,
        b: b1,
        l: lum(LumParams {
            r: d_r,
            g: d_g,
            b: d_b,
        }),
    });
    (
        (r2 * 255.0).round().clamp(0.0, 255.0) as u8,
        (g2 * 255.0).round().clamp(0.0, 255.0) as u8,
        (b2 * 255.0).round().clamp(0.0, 255.0) as u8,
    )
}

#[allow(non_camel_case_types)]
pub struct Blend_saturationParams {
    pub(crate) dr: u8,
    pub(crate) dg: u8,
    pub(crate) db: u8,
    pub(crate) sr: u8,
    pub(crate) sg: u8,
    pub(crate) sb: u8,
}

#[allow(dead_code)]
impl Blend_saturationParams {
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

pub(crate) fn blend_saturation(params: Blend_saturationParams) -> (u8, u8, u8) {
    let dr = params.dr();
    let dg = params.dg();
    let db = params.db();
    let sr = params.sr();
    let sg = params.sg();
    let sb = params.sb();
    let (d_r, d_g, d_b) = (dr as f32 / 255.0, dg as f32 / 255.0, db as f32 / 255.0);
    let (s_r, s_g, s_b) = (sr as f32 / 255.0, sg as f32 / 255.0, sb as f32 / 255.0);
    let (r1, g1, b1) = set_sat(Set_satParams {
        r: d_r,
        g: d_g,
        b: d_b,
        s: sat(SatParams {
            r: s_r,
            g: s_g,
            b: s_b,
        }),
    });
    let (r2, g2, b2) = set_lum(Set_lumParams {
        r: r1,
        g: g1,
        b: b1,
        l: lum(LumParams {
            r: d_r,
            g: d_g,
            b: d_b,
        }),
    });
    (
        (r2 * 255.0).round().clamp(0.0, 255.0) as u8,
        (g2 * 255.0).round().clamp(0.0, 255.0) as u8,
        (b2 * 255.0).round().clamp(0.0, 255.0) as u8,
    )
}

#[allow(non_camel_case_types)]
pub struct Blend_colorParams {
    pub(crate) dr: u8,
    pub(crate) dg: u8,
    pub(crate) db: u8,
    pub(crate) sr: u8,
    pub(crate) sg: u8,
    pub(crate) sb: u8,
}

#[allow(dead_code)]
impl Blend_colorParams {
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

pub(crate) fn blend_color(params: Blend_colorParams) -> (u8, u8, u8) {
    let dr = params.dr();
    let dg = params.dg();
    let db = params.db();
    let sr = params.sr();
    let sg = params.sg();
    let sb = params.sb();
    let (d_r, d_g, d_b) = (dr as f32 / 255.0, dg as f32 / 255.0, db as f32 / 255.0);
    let (s_r, s_g, s_b) = (sr as f32 / 255.0, sg as f32 / 255.0, sb as f32 / 255.0);
    let (r, g, b) = set_lum(Set_lumParams {
        r: s_r,
        g: s_g,
        b: s_b,
        l: lum(LumParams {
            r: d_r,
            g: d_g,
            b: d_b,
        }),
    });
    (
        (r * 255.0).round().clamp(0.0, 255.0) as u8,
        (g * 255.0).round().clamp(0.0, 255.0) as u8,
        (b * 255.0).round().clamp(0.0, 255.0) as u8,
    )
}

#[allow(non_camel_case_types)]
pub struct Blend_luminosityParams {
    pub(crate) dr: u8,
    pub(crate) dg: u8,
    pub(crate) db: u8,
    pub(crate) sr: u8,
    pub(crate) sg: u8,
    pub(crate) sb: u8,
}

#[allow(dead_code)]
impl Blend_luminosityParams {
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

pub(crate) fn blend_luminosity(params: Blend_luminosityParams) -> (u8, u8, u8) {
    let dr = params.dr();
    let dg = params.dg();
    let db = params.db();
    let sr = params.sr();
    let sg = params.sg();
    let sb = params.sb();
    let (d_r, d_g, d_b) = (dr as f32 / 255.0, dg as f32 / 255.0, db as f32 / 255.0);
    let (s_r, s_g, s_b) = (sr as f32 / 255.0, sg as f32 / 255.0, sb as f32 / 255.0);
    let (r, g, b) = set_lum(Set_lumParams {
        r: d_r,
        g: d_g,
        b: d_b,
        l: lum(LumParams {
            r: s_r,
            g: s_g,
            b: s_b,
        }),
    });
    (
        (r * 255.0).round().clamp(0.0, 255.0) as u8,
        (g * 255.0).round().clamp(0.0, 255.0) as u8,
        (b * 255.0).round().clamp(0.0, 255.0) as u8,
    )
}
