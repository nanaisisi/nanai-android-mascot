/**
 * @file pattern_control.rs
 * @brief パターン描画方式 (Start, Stop, Parallel, Alternative, Bind) ステップ実行単体テスト
 */
use super::*;

#[test]
fn test_animation_scheduler_stepping_and_control_methods() {
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
                method: DrawMethod::Overlay,
                x: 0,
                y: 0,
                options: vec![],
            },
            AnimationPattern {
                index: 3,
                surface: 104,
                wait: 10,
                wait_max: None,
                method: DrawMethod::Replace,
                x: 0,
                y: 0,
                options: vec![],
            },
            AnimationPattern {
                index: 4,
                surface: 105,
                wait: 10,
                wait_max: None,
                method: DrawMethod::Interpolate,
                x: 0,
                y: 0,
                options: vec![],
            },
            AnimationPattern {
                index: 5,
                surface: 106,
                wait: 10,
                wait_max: None,
                method: DrawMethod::Add,
                x: 0,
                y: 0,
                options: vec![],
            },
            AnimationPattern {
                index: 6,
                surface: 107,
                wait: 10,
                wait_max: None,
                method: DrawMethod::Bind,
                x: 0,
                y: 0,
                options: vec![],
            },
        ],
    };

    let target_anim = SerikoAnimation {
        id: 20,
        name: None,
        interval: Some(Interval::Always),
        options: vec![],
        collisions: vec![],
        patterns: vec![AnimationPattern {
            index: 0,
            surface: 200,
            wait: 50,
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

    // pattern 0: Start(20)
    let events = scheduler.step_with_catalog(10, &catalog);
    assert!(!events.is_empty());
    assert_eq!(scheduler.active_count(0), 2); // target_anim が自動起動

    // pattern 1: Stop(20)
    let events2 = scheduler.step_with_catalog(10, &catalog);
    assert!(!events2.is_empty());

    // pattern 2: Overlay
    let _ = scheduler.step_with_catalog(10, &catalog);

    // pattern 3: Replace
    let _ = scheduler.step_with_catalog(10, &catalog);

    // pattern 4: Interpolate
    let _ = scheduler.step_with_catalog(10, &catalog);

    // pattern 5: Add
    let _ = scheduler.step_with_catalog(10, &catalog);

    // pattern 6: Bind
    let _ = scheduler.step_with_catalog(10, &catalog);

    scheduler.set_animation_offset(0, 10, 5, 10);
    assert_eq!(scheduler.get_animation_offset(0, 10), (5, 10));
    assert_eq!(scheduler.get_animation_offset(0, 999), (0, 0));
}

#[test]
fn test_stepping_empty_parallel_methods() {
    let mut scheduler = AnimationScheduler::new();
    let anim = SerikoAnimation {
        id: 100,
        name: None,
        interval: Some(Interval::RunOnce),
        options: vec![],
        collisions: vec![],
        patterns: vec![
            AnimationPattern {
                index: 0,
                method: DrawMethod::ParallelStart(vec![]),
                surface: 10,
                wait: 10,
                wait_max: None,
                x: 0,
                y: 0,
                options: vec![],
            },
            AnimationPattern {
                index: 1,
                method: DrawMethod::ParallelStop(vec![]),
                surface: 11,
                wait: 10,
                wait_max: None,
                x: 0,
                y: 0,
                options: vec![],
            },
            AnimationPattern {
                index: 2,
                method: DrawMethod::AlternativeStart(vec![]),
                surface: 12,
                wait: 10,
                wait_max: None,
                x: 0,
                y: 0,
                options: vec![],
            },
            AnimationPattern {
                index: 3,
                method: DrawMethod::AlternativeStop(vec![]),
                surface: 13,
                wait: 10,
                wait_max: None,
                x: 0,
                y: 0,
                options: vec![],
            },
            AnimationPattern {
                index: 4,
                method: DrawMethod::AlternativeStart(vec![10]),
                surface: 14,
                wait: 10,
                wait_max: None,
                x: 0,
                y: 0,
                options: vec![],
            },
            AnimationPattern {
                index: 5,
                method: DrawMethod::AlternativeStop(vec![11]),
                surface: 15,
                wait: 10,
                wait_max: None,
                x: 0,
                y: 0,
                options: vec![],
            },
        ],
    };
    scheduler.start_animation(0, 0, &anim);
    let _ = scheduler.step(15);
    let _ = scheduler.step(15);
}

#[test]
fn test_stepping_catalog_missing_animation_id() {
    let mut scheduler = AnimationScheduler::new();
    let anim = SerikoAnimation {
        id: 200,
        name: None,
        interval: Some(Interval::RunOnce),
        options: vec![],
        collisions: vec![],
        patterns: vec![AnimationPattern {
            index: 0,
            method: DrawMethod::Start(Some(9999)),
            surface: 10,
            wait: 10,
            wait_max: None,
            x: 0,
            y: 0,
            options: vec![],
        }],
    };
    scheduler.start_animation(0, 0, &anim);
    let non_matching_catalog = vec![SerikoAnimation {
        id: 8888,
        name: None,
        interval: Some(Interval::RunOnce),
        options: vec![],
        collisions: vec![],
        patterns: vec![AnimationPattern {
            index: 0,
            method: DrawMethod::Overlay,
            surface: 10,
            wait: 10,
            wait_max: None,
            x: 0,
            y: 0,
            options: vec![],
        }],
    }];
    let _ = scheduler.step_with_catalog(15, &non_matching_catalog);
}

#[test]
fn test_stepping_stop_others_retains_and_drops() {
    let mut scheduler = AnimationScheduler::new();
    let anim_stop = SerikoAnimation {
        id: 50,
        name: None,
        interval: Some(Interval::RunOnce),
        options: vec![],
        collisions: vec![],
        patterns: vec![AnimationPattern {
            index: 0,
            surface: -2,
            wait: 10,
            wait_max: None,
            method: DrawMethod::Overlay,
            x: 0,
            y: 0,
            options: vec![],
        }],
    };
    let anim_normal = SerikoAnimation {
        id: 51,
        name: None,
        interval: Some(Interval::Always),
        options: vec![],
        collisions: vec![],
        patterns: vec![AnimationPattern {
            index: 0,
            surface: 300,
            wait: 100,
            wait_max: None,
            method: DrawMethod::Overlay,
            x: 0,
            y: 0,
            options: vec![],
        }],
    };
    scheduler.start_animation(0, 0, &anim_normal);
    scheduler.start_animation(0, 0, &anim_stop);
    assert_eq!(scheduler.active_count(0), 2);
    let _ = scheduler.step(15);
}
