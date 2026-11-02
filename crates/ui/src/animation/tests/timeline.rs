use super::*;

#[test]
fn test_build_timeline() {
    let patterns = vec![super::pattern(0, 6, 0), super::pattern(1, -1, 85)];
    let timeline = build_timeline(&patterns);
    assert_eq!(timeline[0].at_ms, 0);
    assert_eq!(timeline[1].at_ms, 85);

    assert_eq!(cycle_len_ms(&patterns), 170);

    let shuffled = vec![super::pattern(1, -1, 85), super::pattern(0, 6, 0)];
    let timeline = build_timeline(&shuffled);
    assert_eq!(timeline[0].pattern.surface, 6);
    assert_eq!(timeline[1].at_ms, 85);
}

#[test]
fn test_frame_at() {
    let patterns = vec![super::pattern(0, 6, 0), super::pattern(1, -1, 85)];
    let tl = Timeline::new(&patterns);
    assert_eq!(tl.frame_at(0).unwrap().pattern.surface, 6);
    assert_eq!(tl.frame_at(84).unwrap().pattern.surface, 6);
    assert_eq!(tl.frame_at(85).unwrap().pattern.surface, -1);
    assert_eq!(tl.frame_at(10_000).unwrap().pattern.surface, -1);
    assert_eq!(tl.total_ms(), 170);

    assert!(Timeline::new(&[]).frame_at(500).is_none());
    assert_eq!(Timeline::new(&[]).total_ms(), 0);
    assert_eq!(cycle_len_ms(&[]), 0);
}

#[test]
fn test_multi_frame_timeline() {
    let patterns = vec![
        super::pattern(0, 9, 150),
        super::pattern(1, 10, 150),
        super::pattern(2, -1, 0),
    ];
    let timeline = build_timeline(&patterns);
    assert_eq!(
        [timeline[0].at_ms, timeline[1].at_ms, timeline[2].at_ms],
        [150, 300, 300]
    );
    assert_eq!(cycle_len_ms(&patterns), 300);
}

#[test]
fn test_interval_firing() {
    assert_eq!(Interval::parse("random,5").fire_per_second(), Some(0.2));
    assert!((Interval::parse("sometimes").fire_per_second().unwrap() - 0.1).abs() < 1e-9);
    assert!((Interval::parse("rarely").fire_per_second().unwrap() - 1f64 / 30f64).abs() < 1e-9);

    assert_eq!(Interval::parse("periodic,1000").periodic_ms(), Some(1000));
    assert!(Interval::parse("periodic,1000").should_fire(1_000, 0.99));
    assert!(Interval::parse("periodic,1000").should_fire(10_000, 0.99));
    assert!(!Interval::parse("periodic,1000").should_fire(500, 0.99));

    for v in ["never", "bind", "talk", "starttalk", "endtalk", r"\e"] {
        assert!(!Interval::parse(v).should_fire(100_000, 0.0), "{v}");
    }

    assert!(Interval::parse("runonce").should_fire(0, 0.0));
    assert!(Interval::parse("always").should_fire(0, 0.0));

    let random5 = Interval::parse("random,5");
    assert!(random5.should_fire(5_000, 0.5), "5秒経過で確率は1.0");
    assert!(!random5.should_fire(1_000, 0.9), "1秒経過で確率は0.2");
    assert!(random5.should_fire(1_000, 0.1), "1秒経過・乱数0.1は発火");
}

#[test]
fn test_mock_nanai_animation() {
    let path = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("../../assets/ghost/mock_nanai/shell/master/surfaces.txt");
    if !path.exists() {
        return;
    }
    let content = crate::vfs::open_text_file(&path).unwrap();
    let txt = SurfacesTxt::parse(&content);
    let def0 = txt.surface(0).unwrap();
    let anim0 = &def0.animations[&0];
    assert_eq!(anim0.interval, Some(Interval::Random(3)));
    let timeline = build_timeline(&anim0.patterns);
    assert_eq!(timeline[0].pattern.surface, 6);
    assert_eq!(timeline[0].at_ms, 0);
    assert_eq!(timeline[1].pattern.surface, -1);
    assert_eq!(timeline[1].at_ms, 85);
}
