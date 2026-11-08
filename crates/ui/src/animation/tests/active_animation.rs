/**
 * @file active_animation.rs
 * @brief ActiveAnimation & Interval 動作単体テスト
 */
use super::*;
use crate::animation::scheduler::ActiveAnimation;

#[test]
fn test_animation_extra_coverage() {
    assert_eq!(Interval::parse("random,0").fire_per_second(), Some(1.0));
    let patterns = vec![super::pattern(0, 6, 100)];
    let tl = Timeline::new(&patterns);
    assert_eq!(tl.frames().len(), 1);
    assert_eq!(tl.total_ms(), 200);
}

#[test]
fn test_active_animation_edge_cases() {
    let mut empty_anim = ActiveAnimation::new(1, 0, vec![]);
    assert!(empty_anim.advance(100, 0).is_none());
    let _ = format!("{:?}", empty_anim);
    let _ = empty_anim.clone();

    // Single pattern
    let mut anim1 = ActiveAnimation::new(
        1,
        0,
        vec![AnimationPattern {
            index: 0,
            method: DrawMethod::Overlay,
            surface: 100,
            wait: 10,
            wait_max: None,
            x: 0,
            y: 0,
            options: vec![],
        }],
    );
    assert!(anim1.advance(15, 0).is_some());
    assert!(anim1.advance(15, 0).is_none());
    assert!(anim1.is_finished);

    // Paused animation check
    let mut anim_paused = ActiveAnimation::new(
        1,
        0,
        vec![AnimationPattern {
            index: 0,
            method: DrawMethod::Overlay,
            surface: 100,
            wait: 10,
            wait_max: None,
            x: 0,
            y: 0,
            options: vec![],
        }],
    );
    anim_paused.is_paused = true;
    assert!(anim_paused.advance(100, 0).is_none());

    // Surface -1 check (is_surface_minus_one)
    let mut anim_minus_one = ActiveAnimation::new(
        1,
        0,
        vec![AnimationPattern {
            index: 0,
            method: DrawMethod::Overlay,
            surface: -1,
            wait: 10,
            wait_max: None,
            x: 0,
            y: 0,
            options: vec![],
        }],
    );
    assert!(anim_minus_one.advance(15, 0).is_some());
    assert!(anim_minus_one.is_finished);

    // Intermediate surface -1 test
    let mut anim_mid_minus_one = ActiveAnimation::new(
        3,
        0,
        vec![
            AnimationPattern {
                index: 0,
                method: DrawMethod::Overlay,
                surface: -1,
                wait: 10,
                wait_max: None,
                x: 0,
                y: 0,
                options: vec![],
            },
            AnimationPattern {
                index: 1,
                method: DrawMethod::Overlay,
                surface: 102,
                wait: 10,
                wait_max: None,
                x: 0,
                y: 0,
                options: vec![],
            },
        ],
    );
    assert!(anim_mid_minus_one.advance(15, 0).is_some());
    assert!(anim_mid_minus_one.is_finished);

    // Multi pattern
    let mut anim2 = ActiveAnimation::new(
        2,
        0,
        vec![
            AnimationPattern {
                index: 0,
                method: DrawMethod::Overlay,
                surface: 100,
                wait: 10,
                wait_max: None,
                x: 0,
                y: 0,
                options: vec![],
            },
            AnimationPattern {
                index: 1,
                method: DrawMethod::Overlay,
                surface: 101,
                wait: 20,
                wait_max: None,
                x: 0,
                y: 0,
                options: vec![],
            },
        ],
    );
    assert_eq!(anim2.next_step_at_ms, 10);
    assert!(anim2.advance(15, 0).is_some());
    assert_eq!(anim2.next_step_at_ms, 30);
    assert!(anim2.advance(25, 0).is_some());
    assert!(anim2.is_finished);
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
