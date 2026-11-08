//! W3C Compositing and Blending Level 1 Non-separable & HSL helper algorithms

#[inline]
pub(crate) fn lum(r: f32, g: f32, b: f32) -> f32 {
    0.3 * r + 0.59 * g + 0.11 * b
}

#[inline]
pub(crate) fn clip_color(mut r: f32, mut g: f32, mut b: f32) -> (f32, f32, f32) {
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

#[inline]
pub(crate) fn set_lum(r: f32, g: f32, b: f32, l: f32) -> (f32, f32, f32) {
    let d = l - lum(r, g, b);
    clip_color(r + d, g + d, b + d)
}

#[inline]
pub(crate) fn sat(r: f32, g: f32, b: f32) -> f32 {
    r.max(g).max(b) - r.min(g).min(b)
}

pub(crate) fn set_sat(r: f32, g: f32, b: f32, s: f32) -> (f32, f32, f32) {
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

pub(crate) fn blend_hue(dr: u8, dg: u8, db: u8, sr: u8, sg: u8, sb: u8) -> (u8, u8, u8) {
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

pub(crate) fn blend_saturation(dr: u8, dg: u8, db: u8, sr: u8, sg: u8, sb: u8) -> (u8, u8, u8) {
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

pub(crate) fn blend_color(dr: u8, dg: u8, db: u8, sr: u8, sg: u8, sb: u8) -> (u8, u8, u8) {
    let (d_r, d_g, d_b) = (dr as f32 / 255.0, dg as f32 / 255.0, db as f32 / 255.0);
    let (s_r, s_g, s_b) = (sr as f32 / 255.0, sg as f32 / 255.0, sb as f32 / 255.0);
    let (r, g, b) = set_lum(s_r, s_g, s_b, lum(d_r, d_g, d_b));
    (
        (r * 255.0).round().clamp(0.0, 255.0) as u8,
        (g * 255.0).round().clamp(0.0, 255.0) as u8,
        (b * 255.0).round().clamp(0.0, 255.0) as u8,
    )
}

pub(crate) fn blend_luminosity(dr: u8, dg: u8, db: u8, sr: u8, sg: u8, sb: u8) -> (u8, u8, u8) {
    let (d_r, d_g, d_b) = (dr as f32 / 255.0, dg as f32 / 255.0, db as f32 / 255.0);
    let (s_r, s_g, s_b) = (sr as f32 / 255.0, sg as f32 / 255.0, sb as f32 / 255.0);
    let (r, g, b) = set_lum(d_r, d_g, d_b, lum(s_r, s_g, s_b));
    (
        (r * 255.0).round().clamp(0.0, 255.0) as u8,
        (g * 255.0).round().clamp(0.0, 255.0) as u8,
        (b * 255.0).round().clamp(0.0, 255.0) as u8,
    )
}
