use super::*;

#[test]
fn test_w3c_hsl_functions() {
    let l = lum(LumParams {
        r: 1.0,
        g: 1.0,
        b: 1.0,
    });
    assert!((l - 1.0).abs() < 1e-4);

    let (r, g, b) = clip_color(Clip_colorParams {
        r: 0.5,
        g: 0.5,
        b: 0.5,
    });
    assert_eq!((r, g, b), (0.5, 0.5, 0.5));

    let (r, g, b) = blend_hue(Blend_hueParams {
        dr: 128,
        dg: 128,
        db: 128,
        sr: 255,
        sg: 0,
        sb: 0,
    });
    assert!(r > 0 || g > 0 || b > 0);
}
