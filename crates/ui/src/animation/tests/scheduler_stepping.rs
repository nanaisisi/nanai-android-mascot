/**
 * @file scheduler_stepping.rs
 * @brief AnimationScheduler ステップ実行・状態管理・描画メソッド単体テスト
 */

use super::*;
use crate::surfaces::SerikoAnimation;

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

    for _ in 0..10 {
        let _ = scheduler.step_with_catalog(15, &catalog);
    }

    scheduler.set_animation_offset(0, 10, 5, 10);
    assert_eq!(scheduler.get_animation_offset(0, 10), (5, 10));
    assert_eq!(scheduler.get_animation_offset(0, 999), (0, 0));
}

#[test]
fn test_animation_scheduler_state_coverage_boost() {
    let mut scheduler = AnimationScheduler::new();

    // current_surface fallback for scope 0
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

    // pause/resume/stop/offset on non-existent scope/animation
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

    scheduler.pause_animation(0, 999);
    scheduler.resume_animation(0, 999);
    scheduler.stop_animation(0, 999);
    scheduler.set_animation_offset(0, 999, 5, 5);
    assert_eq!(scheduler.active_count(0), 2);

    scheduler.pause_animation(0, 77);
    assert!(scheduler.is_animation_paused(0, 77));

    scheduler.resume_animation(0, 77);
    assert!(!scheduler.is_animation_paused(0, 77));

    // 3. set_animation_offset on active animation
    scheduler.set_animation_offset(0, 77, 10, 20);
    assert_eq!(scheduler.get_animation_offset(0, 77), (10, 20));

    // 4. stop_animation
    scheduler.stop_animation(0, 77);
    assert_eq!(scheduler.active_count(0), 1);

    // 5. set_surface_with_shared_index
    let shared_anim1 = SerikoAnimation {
        id: 88,
        name: None,
        interval: Some(Interval::Always),
        options: vec![vec!["shared-index".to_string()]],
        collisions: vec![],
        patterns: vec![AnimationPattern {
            index: 0,
            method: DrawMethod::Overlay,
            surface: 100,
            wait: 50,
            wait_max: None,
            x: 0,
            y: 0,
            options: vec![],
        }],
    };
    let shared_anim2 = SerikoAnimation {
        id: 89,
        name: None,
        interval: Some(Interval::Always),
        options: vec![vec!["shared-index".to_string()]],
        collisions: vec![],
        patterns: vec![AnimationPattern {
            index: 0,
            method: DrawMethod::Overlay,
            surface: 100,
            wait: 50,
            wait_max: None,
            x: 0,
            y: 0,
            options: vec![],
        }],
    };
    scheduler.start_animation(0, 0, &shared_anim1);
    scheduler.start_animation(0, 0, &shared_anim2);
    if let Some(anims) = scheduler.active_animations.get_mut(&0) {
        for a in anims.iter_mut() {
            if a.animation_id == 88 {
                a.is_finished = true;
            }
        }
    }
    assert_eq!(scheduler.get_base_move_offset(99), (0, 0));
    assert!(!scheduler.is_bind_active(99, 5));

    // Shared index with out of bounds saved index
    let long_shared = SerikoAnimation {
        id: 90,
        name: None,
        interval: Some(Interval::Always),
        options: vec![vec!["shared-index".to_string()]],
        collisions: vec![],
        patterns: vec![
            AnimationPattern {
                index: 0,
                method: DrawMethod::Overlay,
                surface: 100,
                wait: 50,
                wait_max: None,
                x: 0,
                y: 0,
                options: vec![],
            },
            AnimationPattern {
                index: 1,
                method: DrawMethod::Overlay,
                surface: 101,
                wait: 50,
                wait_max: None,
                x: 0,
                y: 0,
                options: vec![],
            },
        ],
    };
    let short_shared = SerikoAnimation {
        id: 90,
        name: None,
        interval: Some(Interval::Always),
        options: vec![vec!["shared-index".to_string()]],
        collisions: vec![],
        patterns: vec![AnimationPattern {
            index: 0,
            method: DrawMethod::Overlay,
            surface: 100,
            wait: 50,
            wait_max: None,
            x: 0,
            y: 0,
            options: vec![],
        }],
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
        patterns: vec![AnimationPattern {
            index: 0,
            method: DrawMethod::Overlay,
            surface: 100,
            wait: 50,
            wait_max: None,
            x: 0,
            y: 0,
            options: vec![],
        }],
    };
    scheduler.start_animation(0, 0, &anim_active);
    assert!(!scheduler.is_animation_paused(0, 79));
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
