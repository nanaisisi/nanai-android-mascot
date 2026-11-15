//! W3C Compositing and Blending Level 1 輝度・彩度・クリッピングヘルパー

#[allow(non_camel_case_types)]
pub struct LumParams {
    pub(crate) r: f32,
    pub(crate) g: f32,
    pub(crate) b: f32,
}

#[allow(dead_code)]
impl LumParams {
    pub fn r(&self) -> f32 {
        self.r
    }
    pub fn g(&self) -> f32 {
        self.g
    }
    pub fn b(&self) -> f32 {
        self.b
    }
}

#[inline]
pub(crate) fn lum(params: LumParams) -> f32 {
    0.3 * params.r() + 0.59 * params.g() + 0.11 * params.b()
}

#[allow(non_camel_case_types)]
pub struct Clip_colorParams {
    pub(crate) r: f32,
    pub(crate) g: f32,
    pub(crate) b: f32,
}

#[allow(dead_code)]
impl Clip_colorParams {
    pub fn r(&self) -> f32 {
        self.r
    }
    pub fn g(&self) -> f32 {
        self.g
    }
    pub fn b(&self) -> f32 {
        self.b
    }
}

#[inline]
pub(crate) fn clip_color(params: Clip_colorParams) -> (f32, f32, f32) {
    let mut r = params.r();
    let mut g = params.g();
    let mut b = params.b();
    let l = lum(LumParams { r, g, b });
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

#[allow(non_camel_case_types)]
pub struct Set_lumParams {
    pub(crate) r: f32,
    pub(crate) g: f32,
    pub(crate) b: f32,
    pub(crate) l: f32,
}

#[allow(dead_code)]
impl Set_lumParams {
    pub fn r(&self) -> f32 {
        self.r
    }
    pub fn g(&self) -> f32 {
        self.g
    }
    pub fn b(&self) -> f32 {
        self.b
    }
    pub fn l(&self) -> f32 {
        self.l
    }
}

#[inline]
pub(crate) fn set_lum(params: Set_lumParams) -> (f32, f32, f32) {
    let d = params.l()
        - lum(LumParams {
            r: params.r(),
            g: params.g(),
            b: params.b(),
        });
    clip_color(Clip_colorParams {
        r: params.r() + d,
        g: params.g() + d,
        b: params.b() + d,
    })
}

#[allow(non_camel_case_types)]
pub struct SatParams {
    pub(crate) r: f32,
    pub(crate) g: f32,
    pub(crate) b: f32,
}

#[allow(dead_code)]
impl SatParams {
    pub fn r(&self) -> f32 {
        self.r
    }
    pub fn g(&self) -> f32 {
        self.g
    }
    pub fn b(&self) -> f32 {
        self.b
    }
}

#[inline]
pub(crate) fn sat(params: SatParams) -> f32 {
    params.r().max(params.g()).max(params.b()) - params.r().min(params.g()).min(params.b())
}

#[allow(non_camel_case_types)]
pub struct Set_satParams {
    pub(crate) r: f32,
    pub(crate) g: f32,
    pub(crate) b: f32,
    pub(crate) s: f32,
}

#[allow(dead_code)]
impl Set_satParams {
    pub fn r(&self) -> f32 {
        self.r
    }
    pub fn g(&self) -> f32 {
        self.g
    }
    pub fn b(&self) -> f32 {
        self.b
    }
    pub fn s(&self) -> f32 {
        self.s
    }
}

pub(crate) fn set_sat(params: Set_satParams) -> (f32, f32, f32) {
    let r = params.r();
    let g = params.g();
    let b = params.b();
    let s = params.s();
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
