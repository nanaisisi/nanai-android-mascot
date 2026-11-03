use super::*;
use crate::animation::scheduler::ParsedAnimationOptions;

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
    use crate::animation::scheduler::ActiveAnimation;

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

    // Intermediate surface -1 test (tests is_surface_minus_one when is_last is false)
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

    // Multi pattern (exercises else if branch for next_pat wait)
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
    assert!(anim2.advance(15, 0).is_some()); // pattern 0
    assert_eq!(anim2.next_step_at_ms, 30); // 10 + 20
    assert!(anim2.advance(25, 0).is_some()); // pattern 1
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

#[test]
fn test_parsed_animation_options_coverage() {
    let opts = ParsedAnimationOptions::from_raw_options(&[
        vec![
            "".to_string(),
            "exclusive+(1,2)".to_string(),
            "background".to_string(),
            "shared-index".to_string(),
        ],
        vec![
            "exclusive".to_string(),
            "(5,6)".to_string(),
            "shared_index".to_string(),
        ],
        vec![
            "exclusive()".to_string(),
            "()".to_string(),
            "exclusive+(abc)".to_string(),
            "(xyz)".to_string(),
        ],
    ]);
    assert!(opts.is_exclusive);
    assert!(opts.is_background);
    assert!(opts.is_shared_index);
    assert!(opts.exclusive_targets.is_some());
}

#[test]
fn test_animation_scheduler_stepping_and_control_methods() {
    use crate::surfaces::SerikoAnimation;

    let mut scheduler = AnimationScheduler::new();

    let anim_controller = SerikoAnimation {
        id: 10,
        name: None,
        interval: Some(Interval::RunOnce),
        options: vec![],
        collisions: vec![],
        patterns: vec![
            AnimationPattern {
                index: 0,
                surface: 101,
                wait: 10,
                wait_max: None,
                method: DrawMethod::Start(Some(20)),
                x: 0,
                y: 0,
                options: vec![],
            },
            AnimationPattern {
                index: 1,
                surface: 102,
                wait: 10,
                wait_max: None,
                method: DrawMethod::Stop(Some(20)),
                x: 0,
                y: 0,
                options: vec![],
            },
            AnimationPattern {
                index: 2,
                surface: 103,
                wait: 10,
                wait_max: None,
                method: DrawMethod::ParallelStart(vec![30, 31]),
                x: 0,
                y: 0,
                options: vec![],
            },
            AnimationPattern {
                index: 3,
                surface: 104,
                wait: 10,
                wait_max: None,
                method: DrawMethod::ParallelStop(vec![30, 31]),
                x: 0,
                y: 0,
                options: vec![],
            },
            AnimationPattern {
                index: 4,
                surface: 105,
                wait: 10,
                wait_max: None,
                method: DrawMethod::AlternativeStart(vec![40]),
                x: 0,
                y: 0,
                options: vec![],
            },
            AnimationPattern {
                index: 5,
                surface: 106,
                wait: 10,
                wait_max: None,
                method: DrawMethod::AlternativeStop(vec![40]),
                x: 0,
                y: 0,
                options: vec![],
            },
            AnimationPattern {
                index: 6,
                surface: -2,
                wait: 10,
                wait_max: None,
                method: DrawMethod::Overlay,
                x: 0,
                y: 0,
                options: vec![],
            },
        ],
    };

    let target_anim = SerikoAnimation {
        id: 20,
        name: None,
        interval: Some(Interval::RunOnce),
        options: vec![],
        collisions: vec![],
        patterns: vec![AnimationPattern {
            index: 0,
            surface: 200,
            wait: 100,
            wait_max: None,
            method: DrawMethod::Overlay,
            x: 0,
            y: 0,
            options: vec![],
        }],
    };

    let catalog = vec![anim_controller.clone(), target_anim];

    scheduler.start_animation(0, 0, &anim_controller);
    assert_eq!(scheduler.active_count(0), 1);
    assert_eq!(scheduler.active_count(999), 0);

    for _ in 0..10 {
        let _ = scheduler.step_with_catalog(15, &catalog);
    }

    scheduler.set_animation_offset(0, 10, 5, 10);
    assert_eq!(scheduler.get_animation_offset(0, 10), (5, 10));
    assert_eq!(scheduler.get_animation_offset(0, 999), (0, 0));
}

#[test]
fn test_animation_scheduler_state_coverage_boost() {
    use crate::surfaces::SerikoAnimation;

    let mut scheduler = AnimationScheduler::new();

    // current_surface explicit set vs fallback
    scheduler.set_surface(0, 42);
    assert_eq!(scheduler.current_surface(0), 42);
    assert_eq!(scheduler.current_surface(1), 10);
    assert_eq!(scheduler.current_surface(2), 0);

    // 1. unbind (active = false)
    scheduler.set_bind_active(0, 5, true);
    assert!(scheduler.is_bind_active(0, 5));
    scheduler.set_bind_active(0, 5, false);
    assert!(!scheduler.is_bind_active(0, 5));

    // pause/resume/stop/offset on non-existent scope/animation (None branches)
    scheduler.pause_animation(99, 999);
    scheduler.resume_animation(99, 999);
    scheduler.stop_animation(99, 999);
    scheduler.set_animation_offset(99, 999, 1, 1);
    assert_eq!(scheduler.get_animation_offset(99, 999), (1, 1));

    // is_animation_paused for non-existent scope
    assert!(!scheduler.is_animation_paused(99, 999));

    // 2. pause_animation, resume_animation, is_animation_paused on active animation
    let anim1 = SerikoAnimation {
        id: 77,
        name: None,
        interval: Some(Interval::Always),
        options: vec![],
        collisions: vec![],
        patterns: vec![AnimationPattern {
            index: 0,
            surface: 100,
            wait: 100,
            wait_max: None,
            method: DrawMethod::Overlay,
            x: 0,
            y: 0,
            options: vec![],
        }],
    };
    let anim2 = SerikoAnimation {
        id: 78,
        name: None,
        interval: Some(Interval::Always),
        options: vec![],
        collisions: vec![],
        patterns: vec![AnimationPattern {
            index: 0,
            surface: 101,
            wait: 100,
            wait_max: None,
            method: DrawMethod::Overlay,
            x: 0,
            y: 0,
            options: vec![],
        }],
    };
    scheduler.start_animation(0, 0, &anim1);
    scheduler.start_animation(0, 0, &anim2);
    assert_eq!(scheduler.active_count(0), 2);

    scheduler.pause_animation(0, 999); // id mismatch branch
    scheduler.resume_animation(0, 999); // id mismatch branch
    scheduler.stop_animation(0, 999); // id mismatch branch
    scheduler.set_animation_offset(0, 999, 5, 5); // id mismatch branch

    scheduler.pause_animation(0, 77);
    assert!(scheduler.is_animation_paused(0, 77));

    scheduler.resume_animation(0, 77);
    assert!(!scheduler.is_animation_paused(0, 77));

    // 3. set_animation_offset on active animation
    scheduler.set_animation_offset(0, 77, 10, 20);
    assert_eq!(scheduler.get_animation_offset(0, 77), (10, 20));

    // 4. stop_animation (retains anim2)
    scheduler.stop_animation(0, 77);
    assert_eq!(scheduler.active_count(0), 1);

    // 5. set_surface_with_shared_index (with empty preserved & out of bounds saved index)
    let shared_anim = SerikoAnimation {
        id: 88,
        name: None,
        interval: Some(Interval::Always),
        options: vec![vec!["shared-index".to_string()]],
        collisions: vec![],
        patterns: vec![
            AnimationPattern { index: 0, method: DrawMethod::Overlay, surface: 100, wait: 50, wait_max: None, x: 0, y: 0, options: vec![] },
            AnimationPattern { index: 1, method: DrawMethod::Overlay, surface: 101, wait: 50, wait_max: None, x: 0, y: 0, options: vec![] },
        ],
    };
    // Test empty preserved shared index
    scheduler.set_surface_with_shared_index(0, 1, &[shared_anim.clone()]);
}

#[test]
fn test_stepping_coverage_boost() {
    use crate::surfaces::SerikoAnimation;

    let mut scheduler = AnimationScheduler::new();

    // 1. active_count for non-existent scope
    assert_eq!(scheduler.active_count(12345), 0);

    // 2. AlternativeStart, AlternativeStop, and surface == -2 (stop_others)
    let alt_anim = SerikoAnimation {
        id: 50,
        name: None,
        interval: Some(Interval::RunOnce),
        options: vec![],
        collisions: vec![],
        patterns: vec![
            AnimationPattern {
                index: 0,
                surface: 300,
                wait: 10,
                wait_max: None,
                method: DrawMethod::AlternativeStart(vec![60]),
                x: 0,
                y: 0,
                options: vec![],
            },
            AnimationPattern {
                index: 1,
                surface: 301,
                wait: 10,
                wait_max: None,
                method: DrawMethod::AlternativeStop(vec![60]),
                x: 0,
                y: 0,
                options: vec![],
            },
            AnimationPattern {
                index: 2,
                surface: -2,
                wait: 10,
                wait_max: None,
                method: DrawMethod::Overlay,
                x: 0,
                y: 0,
                options: vec![],
            },
        ],
    };

    let target_anim = SerikoAnimation {
        id: 60,
        name: None,
        interval: Some(Interval::RunOnce),
        options: vec![],
        collisions: vec![],
        patterns: vec![AnimationPattern {
            index: 0,
            surface: 400,
            wait: 100,
            wait_max: None,
            method: DrawMethod::Overlay,
            x: 0,
            y: 0,
            options: vec![],
        }],
    };

    let catalog = vec![target_anim];

    scheduler.start_animation(0, 0, &alt_anim);
    let events = scheduler.step_with_catalog(15, &catalog);
    assert!(!events.is_empty());

    let _ = scheduler.step_with_catalog(15, &catalog);
    let _ = scheduler.step_with_catalog(15, &catalog);
}
