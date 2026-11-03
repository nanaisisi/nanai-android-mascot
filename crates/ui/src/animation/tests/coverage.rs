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

    // current_surface fallback for scope 0 (scope_id == 1 is false -> 0)
    assert_eq!(scheduler.current_surface(0), 0);
    assert_eq!(scheduler.current_surface(1), 10);
    assert_eq!(scheduler.current_surface(2), 0);
    scheduler.set_surface(0, 42);
    assert_eq!(scheduler.current_surface(0), 42);

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
    scheduler.stop_animation(0, 999); // id mismatch branch (tests retain keeping all)
    scheduler.set_animation_offset(0, 999, 5, 5); // id mismatch branch
    assert_eq!(scheduler.active_count(0), 2);

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

    // 5. set_surface_with_shared_index (with mixed finished and active shared-index animations)
    let shared_anim1 = SerikoAnimation {
        id: 88,
        name: None,
        interval: Some(Interval::Always),
        options: vec![vec!["shared-index".to_string()]],
        collisions: vec![],
        patterns: vec![
            AnimationPattern { index: 0, method: DrawMethod::Overlay, surface: 100, wait: 50, wait_max: None, x: 0, y: 0, options: vec![] },
        ],
    };
    let shared_anim2 = SerikoAnimation {
        id: 89,
        name: None,
        interval: Some(Interval::Always),
        options: vec![vec!["shared-index".to_string()]],
        collisions: vec![],
        patterns: vec![
            AnimationPattern { index: 0, method: DrawMethod::Overlay, surface: 100, wait: 50, wait_max: None, x: 0, y: 0, options: vec![] },
        ],
    };
    scheduler.start_animation(0, 0, &shared_anim1);
    scheduler.start_animation(0, 0, &shared_anim2);
    if let Some(anims) = scheduler.active_animations.get_mut(&0) {
        for a in anims.iter_mut() {
            if a.animation_id == 88 {
                a.is_finished = true; // finished one (!a.is_finished is false)
            }
        }
    }
    // Non-existent scope base move offset and bind active check
    assert_eq!(scheduler.get_base_move_offset(99), (0, 0));
    assert!(!scheduler.is_bind_active(99, 5));

    // Shared index with out of bounds saved index (saved_index >= anim.patterns.len())
    let long_shared = SerikoAnimation {
        id: 90,
        name: None,
        interval: Some(Interval::Always),
        options: vec![vec!["shared-index".to_string()]],
        collisions: vec![],
        patterns: vec![
            AnimationPattern { index: 0, method: DrawMethod::Overlay, surface: 100, wait: 50, wait_max: None, x: 0, y: 0, options: vec![] },
            AnimationPattern { index: 1, method: DrawMethod::Overlay, surface: 101, wait: 50, wait_max: None, x: 0, y: 0, options: vec![] },
        ],
    };
    let short_shared = SerikoAnimation {
        id: 90,
        name: None,
        interval: Some(Interval::Always),
        options: vec![vec!["shared-index".to_string()]],
        collisions: vec![],
        patterns: vec![
            AnimationPattern { index: 0, method: DrawMethod::Overlay, surface: 100, wait: 50, wait_max: None, x: 0, y: 0, options: vec![] },
        ],
    };
    scheduler.start_animation(0, 0, &long_shared);
    let _ = scheduler.step(60);
    scheduler.set_surface_with_shared_index(0, 1, &[short_shared]);

    // Additional state edge cases
    scheduler.set_surface_with_shared_index(5, 10, &[]);
    scheduler.resume_animation(0, 9999);
    let anim_active = SerikoAnimation {
        id: 79,
        name: None,
        interval: Some(Interval::Always),
        options: vec![],
        collisions: vec![],
        patterns: vec![AnimationPattern { index: 0, method: DrawMethod::Overlay, surface: 100, wait: 50, wait_max: None, x: 0, y: 0, options: vec![] }],
    };
    scheduler.start_animation(0, 0, &anim_active);
    assert!(!scheduler.is_animation_paused(0, 79));
}

#[test]
fn test_stepping_empty_parallel_methods() {
    use crate::surfaces::SerikoAnimation;

    let mut scheduler = AnimationScheduler::new();
    let anim = SerikoAnimation {
        id: 100,
        name: None,
        interval: Some(Interval::RunOnce),
        options: vec![],
        collisions: vec![],
        patterns: vec![
            AnimationPattern { index: 0, method: DrawMethod::ParallelStart(vec![]), surface: 10, wait: 10, wait_max: None, x: 0, y: 0, options: vec![] },
            AnimationPattern { index: 1, method: DrawMethod::ParallelStop(vec![]), surface: 11, wait: 10, wait_max: None, x: 0, y: 0, options: vec![] },
        ],
    };
    scheduler.start_animation(0, 0, &anim);
    let _ = scheduler.step(15);
    let _ = scheduler.step(15);
}

#[test]
fn test_stepping_catalog_missing_animation_id() {
    use crate::surfaces::SerikoAnimation;

    let mut scheduler = AnimationScheduler::new();
    let anim = SerikoAnimation {
        id: 200,
        name: None,
        interval: Some(Interval::RunOnce),
        options: vec![],
        collisions: vec![],
        patterns: vec![
            AnimationPattern { index: 0, method: DrawMethod::Start(Some(9999)), surface: 10, wait: 10, wait_max: None, x: 0, y: 0, options: vec![] },
        ],
    };
    scheduler.start_animation(0, 0, &anim);
    let non_matching_catalog = vec![
        SerikoAnimation {
            id: 8888,
            name: None,
            interval: Some(Interval::RunOnce),
            options: vec![],
            collisions: vec![],
            patterns: vec![AnimationPattern { index: 0, method: DrawMethod::Overlay, surface: 10, wait: 10, wait_max: None, x: 0, y: 0, options: vec![] }],
        }
    ];
    let _ = scheduler.step_with_catalog(15, &non_matching_catalog);
}

#[test]
fn test_triggers_coverage_boost() {
    use crate::surfaces::SerikoAnimation;

    let mut scheduler = AnimationScheduler::new();

    // 1. start_animation with empty patterns (returns early)
    let empty_anim = SerikoAnimation {
        id: 1,
        name: None,
        interval: Some(Interval::Always),
        options: vec![],
        collisions: vec![],
        patterns: vec![],
    };
    scheduler.start_animation(0, 0, &empty_anim);
    assert_eq!(scheduler.active_count(0), 0);

    // 2. Exclusive blocking with specific targets & global exclusive blocking
    let excl_global = SerikoAnimation {
        id: 10,
        name: None,
        interval: Some(Interval::Always),
        options: vec![vec!["exclusive".to_string()]],
        collisions: vec![],
        patterns: vec![AnimationPattern { index: 0, method: DrawMethod::Overlay, surface: 100, wait: 100, wait_max: None, x: 0, y: 0, options: vec![] }],
    };
    let blocked_anim = SerikoAnimation {
        id: 11,
        name: None,
        interval: Some(Interval::Always),
        options: vec![],
        collisions: vec![],
        patterns: vec![AnimationPattern { index: 0, method: DrawMethod::Overlay, surface: 101, wait: 100, wait_max: None, x: 0, y: 0, options: vec![] }],
    };
    scheduler.start_animation(0, 0, &excl_global);
    assert!(scheduler.is_blocked_by_exclusive(0, 11));
    scheduler.start_animation(0, 0, &blocked_anim); // Should be blocked by global exclusive

    // Exclusive with target list
    let excl_target = SerikoAnimation {
        id: 20,
        name: None,
        interval: Some(Interval::Always),
        options: vec![vec!["exclusive(21)".to_string()]],
        collisions: vec![],
        patterns: vec![AnimationPattern { index: 0, method: DrawMethod::Overlay, surface: 102, wait: 100, wait_max: None, x: 0, y: 0, options: vec![] }],
    };
    let _target_anim = SerikoAnimation {
        id: 21,
        name: None,
        interval: Some(Interval::Always),
        options: vec![],
        collisions: vec![],
        patterns: vec![AnimationPattern { index: 0, method: DrawMethod::Overlay, surface: 103, wait: 100, wait_max: None, x: 0, y: 0, options: vec![] }],
    };
    scheduler.stop_animations(0);
    scheduler.start_animation(0, 0, &excl_target);
    assert!(scheduler.is_blocked_by_exclusive(0, 21));
    assert!(!scheduler.is_blocked_by_exclusive(0, 22));

    // 3. Paused animation on start
    scheduler.pause_animation(0, 30);
    let paused_anim = SerikoAnimation {
        id: 30,
        name: None,
        interval: Some(Interval::Always),
        options: vec![],
        collisions: vec![],
        patterns: vec![AnimationPattern { index: 0, method: DrawMethod::Overlay, surface: 104, wait: 100, wait_max: None, x: 0, y: 0, options: vec![] }],
    };
    scheduler.start_animation(0, 0, &paused_anim);
    assert!(scheduler.is_animation_paused(0, 30));

    // 4. schedule_surface_animations (Never, Bind active/inactive, RunOnce, Sometimes/Periodic)
    let anims = vec![
        SerikoAnimation { id: 1, name: None, interval: Some(Interval::Never), options: vec![], collisions: vec![], patterns: vec![AnimationPattern { index: 0, method: DrawMethod::Overlay, surface: 1, wait: 10, wait_max: None, x: 0, y: 0, options: vec![] }] },
        SerikoAnimation { id: 2, name: None, interval: Some(Interval::Bind), options: vec![], collisions: vec![], patterns: vec![AnimationPattern { index: 0, method: DrawMethod::Overlay, surface: 2, wait: 10, wait_max: None, x: 0, y: 0, options: vec![] }] },
        SerikoAnimation { id: 3, name: None, interval: Some(Interval::RunOnce), options: vec![], collisions: vec![], patterns: vec![AnimationPattern { index: 0, method: DrawMethod::Overlay, surface: 3, wait: 10, wait_max: None, x: 0, y: 0, options: vec![] }] },
        SerikoAnimation { id: 4, name: None, interval: Some(Interval::Sometimes), options: vec![], collisions: vec![], patterns: vec![AnimationPattern { index: 0, method: DrawMethod::Overlay, surface: 4, wait: 10, wait_max: None, x: 0, y: 0, options: vec![] }] },
    ];
    scheduler.set_bind_active(0, 2, true);
    scheduler.schedule_surface_animations(0, 0, &anims, 0.0);

    // 5. on_talk_end when talking_flags is false
    scheduler.on_talk_end(0, &anims);

    // 6. Talk triggers (StartTalk, Talk, Custom("talk,2"), EndTalk, YenE)
    let talk_anims = vec![
        SerikoAnimation { id: 100, name: None, interval: Some(Interval::StartTalk), options: vec![], collisions: vec![], patterns: vec![AnimationPattern { index: 0, method: DrawMethod::Overlay, surface: 10, wait: 10, wait_max: None, x: 0, y: 0, options: vec![] }] },
        SerikoAnimation { id: 101, name: None, interval: Some(Interval::Talk), options: vec![], collisions: vec![], patterns: vec![AnimationPattern { index: 0, method: DrawMethod::Overlay, surface: 11, wait: 10, wait_max: None, x: 0, y: 0, options: vec![] }] },
        SerikoAnimation { id: 102, name: None, interval: Some(Interval::Custom("talk,2".to_string())), options: vec![], collisions: vec![], patterns: vec![AnimationPattern { index: 0, method: DrawMethod::Overlay, surface: 12, wait: 10, wait_max: None, x: 0, y: 0, options: vec![] }] },
        SerikoAnimation { id: 103, name: None, interval: Some(Interval::EndTalk), options: vec![], collisions: vec![], patterns: vec![AnimationPattern { index: 0, method: DrawMethod::Overlay, surface: 13, wait: 10, wait_max: None, x: 0, y: 0, options: vec![] }] },
        SerikoAnimation { id: 104, name: None, interval: Some(Interval::YenE), options: vec![], collisions: vec![], patterns: vec![AnimationPattern { index: 0, method: DrawMethod::Overlay, surface: 14, wait: 10, wait_max: None, x: 0, y: 0, options: vec![] }] },
    ];
    scheduler.on_talk_start(0, &talk_anims);
    scheduler.on_char_spoken(0, &talk_anims); // count 1
    scheduler.on_char_spoken(0, &talk_anims); // count 2
    scheduler.on_talk_end(0, &talk_anims); // talking_flags is true
    scheduler.on_script_end(0, &talk_anims);

    // 7. Exclusive with target stopping active animation
    let target_to_stop = SerikoAnimation {
        id: 50,
        name: None,
        interval: Some(Interval::Always),
        options: vec![],
        collisions: vec![],
        patterns: vec![AnimationPattern { index: 0, method: DrawMethod::Overlay, surface: 50, wait: 100, wait_max: None, x: 0, y: 0, options: vec![] }],
    };
    let excl_stopping = SerikoAnimation {
        id: 51,
        name: None,
        interval: Some(Interval::Always),
        options: vec![vec!["exclusive(50)".to_string()]],
        collisions: vec![],
        patterns: vec![AnimationPattern { index: 0, method: DrawMethod::Overlay, surface: 51, wait: 100, wait_max: None, x: 0, y: 0, options: vec![] }],
    };
    scheduler.stop_animations(0);
    scheduler.start_animation(0, 0, &target_to_stop);
    assert_eq!(scheduler.active_count(0), 1);
    scheduler.start_animation(0, 0, &excl_stopping);
}
