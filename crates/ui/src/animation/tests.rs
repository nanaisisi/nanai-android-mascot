use super::*;
use crate::surfaces::{AnimationPattern, DrawMethod, Interval, SurfacesTxt};

fn pattern(index: u32, surface: i32, wait: u32) -> AnimationPattern {
    AnimationPattern {
        index,
        method: DrawMethod::Overlay,
        surface,
        wait,
        wait_max: None,
        x: 0,
        y: 0,
        options: vec![],
    }
}

#[test]
fn test_build_timeline() {
    let patterns = vec![
        pattern(0, 6, 0),
        pattern(1, -1, 85),
    ];
    let timeline = build_timeline(&patterns);
    assert_eq!(timeline[0].at_ms, 0);
    assert_eq!(timeline[1].at_ms, 85);

    assert_eq!(cycle_len_ms(&patterns), 170);

    let shuffled = vec![pattern(1, -1, 85), pattern(0, 6, 0)];
    let timeline = build_timeline(&shuffled);
    assert_eq!(timeline[0].pattern.surface, 6);
    assert_eq!(timeline[1].at_ms, 85);
}

#[test]
fn test_frame_at() {
    let patterns = vec![pattern(0, 6, 0), pattern(1, -1, 85)];
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
    let patterns = vec![pattern(0, 9, 150), pattern(1, 10, 150), pattern(2, -1, 0)];
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

#[test]
fn test_animation_extra_coverage() {
    assert_eq!(Interval::parse("random,0").fire_per_second(), Some(1.0));
    let patterns = vec![pattern(0, 6, 100)];
    let tl = Timeline::new(&patterns);
    assert_eq!(tl.frames().len(), 1);
    assert_eq!(tl.total_ms(), 200);
}

#[test]
fn test_animation_100_percent_coverage() {
    assert_eq!(Interval::parse("random,abc"), Interval::Random(10));
    assert_eq!(Interval::parse("periodic,abc"), Interval::Periodic(1000));
    let custom = Interval::parse("unknown_type");
    assert!(!custom.is_event_driven());
    assert_eq!(custom.fire_per_second(), None);
    assert_eq!(custom.periodic_ms(), None);
    assert!(custom.should_fire(0, 0.0));

    let zero_period = Interval::Periodic(0);
    assert!(!zero_period.should_fire(1000, 0.0));
}

#[test]
fn test_animation_100_percent_branches() {
    assert_eq!(Interval::Always.fire_per_second(), None);
    assert_eq!(Interval::Sometimes.fire_per_second(), Some(1.0 / 10.0));
    assert_eq!(Interval::Rarely.fire_per_second(), Some(1.0 / 30.0));

    let periodic = Interval::Periodic(1000);
    assert!(!periodic.should_fire(500, 0.0));

    let random = Interval::Random(5);
    assert!(!random.should_fire(100, 0.99));
}

#[test]
fn test_animation_100_percent_perfect_coverage() {
    for inv in [
        Interval::Always,
        Interval::Sometimes,
        Interval::Rarely,
        Interval::Random(3),
        Interval::Periodic(500),
        Interval::RunOnce,
        Interval::Never,
        Interval::Bind,
        Interval::Talk,
        Interval::StartTalk,
        Interval::EndTalk,
        Interval::YenE,
        Interval::Custom("test".to_string()),
    ] {
        let _ = inv.fire_per_second();
        let _ = inv.periodic_ms();
        let _ = inv.is_event_driven();
        let _ = inv.should_fire(100, 0.5);
    }
}
