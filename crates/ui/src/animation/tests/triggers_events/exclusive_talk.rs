/**
 * @file exclusive_talk.rs
 * @brief exclusive 排他制御および SERIKO 発話イベント（StartTalk, Talk, EndTalk, YenE）単体テスト
 */

use super::*;

#[test]
fn test_triggers_coverage_boost() {
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
        patterns: vec![AnimationPattern {
            index: 0,
            method: DrawMethod::Overlay,
            surface: 100,
            wait: 100,
            wait_max: None,
            x: 0,
            y: 0,
            options: vec![],
        }],
    };
    let blocked_anim = SerikoAnimation {
        id: 11,
        name: None,
        interval: Some(Interval::Always),
        options: vec![],
        collisions: vec![],
        patterns: vec![AnimationPattern {
            index: 0,
            method: DrawMethod::Overlay,
            surface: 101,
            wait: 100,
            wait_max: None,
            x: 0,
            y: 0,
            options: vec![],
        }],
    };
    scheduler.start_animation(0, 0, &excl_global);
    assert!(scheduler.is_blocked_by_exclusive(0, 11));
    scheduler.start_animation(0, 0, &blocked_anim);

    // Exclusive with target list
    let excl_target = SerikoAnimation {
        id: 20,
        name: None,
        interval: Some(Interval::Always),
        options: vec![vec!["exclusive(21)".to_string()]],
        collisions: vec![],
        patterns: vec![AnimationPattern {
            index: 0,
            method: DrawMethod::Overlay,
            surface: 102,
            wait: 100,
            wait_max: None,
            x: 0,
            y: 0,
            options: vec![],
        }],
    };
    let _target_anim = SerikoAnimation {
        id: 21,
        name: None,
        interval: Some(Interval::Always),
        options: vec![],
        collisions: vec![],
        patterns: vec![AnimationPattern {
            index: 0,
            method: DrawMethod::Overlay,
            surface: 103,
            wait: 100,
            wait_max: None,
            x: 0,
            y: 0,
            options: vec![],
        }],
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
        patterns: vec![AnimationPattern {
            index: 0,
            method: DrawMethod::Overlay,
            surface: 104,
            wait: 100,
            wait_max: None,
            x: 0,
            y: 0,
            options: vec![],
        }],
    };
    scheduler.start_animation(0, 0, &paused_anim);
    assert!(scheduler.is_animation_paused(0, 30));

    // 4. schedule_surface_animations
    let anims = vec![
        SerikoAnimation {
            id: 1,
            name: None,
            interval: Some(Interval::Never),
            options: vec![],
            collisions: vec![],
            patterns: vec![AnimationPattern {
                index: 0,
                method: DrawMethod::Overlay,
                surface: 1,
                wait: 10,
                wait_max: None,
                x: 0,
                y: 0,
                options: vec![],
            }],
        },
        SerikoAnimation {
            id: 2,
            name: None,
            interval: Some(Interval::Bind),
            options: vec![],
            collisions: vec![],
            patterns: vec![AnimationPattern {
                index: 0,
                method: DrawMethod::Overlay,
                surface: 2,
                wait: 10,
                wait_max: None,
                x: 0,
                y: 0,
                options: vec![],
            }],
        },
        SerikoAnimation {
            id: 3,
            name: None,
            interval: Some(Interval::RunOnce),
            options: vec![],
            collisions: vec![],
            patterns: vec![AnimationPattern {
                index: 0,
                method: DrawMethod::Overlay,
                surface: 3,
                wait: 10,
                wait_max: None,
                x: 0,
                y: 0,
                options: vec![],
            }],
        },
        SerikoAnimation {
            id: 4,
            name: None,
            interval: Some(Interval::Sometimes),
            options: vec![],
            collisions: vec![],
            patterns: vec![AnimationPattern {
                index: 0,
                method: DrawMethod::Overlay,
                surface: 4,
                wait: 10,
                wait_max: None,
                x: 0,
                y: 0,
                options: vec![],
            }],
        },
    ];
    scheduler.set_bind_active(0, 2, true);
    scheduler.schedule_surface_animations(0, 0, &anims, 0.0);
    scheduler.schedule_surface_animations(0, 0, &anims, 1.0);

    // 5. on_talk_end when talking_flags is false
    scheduler.on_talk_end(0, &anims);

    // 6. Talk triggers
    let talk_anims = vec![
        SerikoAnimation {
            id: 100,
            name: None,
            interval: Some(Interval::StartTalk),
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
        },
        SerikoAnimation {
            id: 101,
            name: None,
            interval: Some(Interval::Talk),
            options: vec![],
            collisions: vec![],
            patterns: vec![AnimationPattern {
                index: 0,
                method: DrawMethod::Overlay,
                surface: 11,
                wait: 10,
                wait_max: None,
                x: 0,
                y: 0,
                options: vec![],
            }],
        },
        SerikoAnimation {
            id: 102,
            name: None,
            interval: Some(Interval::Custom("talk,2".to_string())),
            options: vec![],
            collisions: vec![],
            patterns: vec![AnimationPattern {
                index: 0,
                method: DrawMethod::Overlay,
                surface: 12,
                wait: 10,
                wait_max: None,
                x: 0,
                y: 0,
                options: vec![],
            }],
        },
        SerikoAnimation {
            id: 103,
            name: None,
            interval: Some(Interval::EndTalk),
            options: vec![],
            collisions: vec![],
            patterns: vec![AnimationPattern {
                index: 0,
                method: DrawMethod::Overlay,
                surface: 13,
                wait: 10,
                wait_max: None,
                x: 0,
                y: 0,
                options: vec![],
            }],
        },
        SerikoAnimation {
            id: 104,
            name: None,
            interval: Some(Interval::YenE),
            options: vec![],
            collisions: vec![],
            patterns: vec![AnimationPattern {
                index: 0,
                method: DrawMethod::Overlay,
                surface: 14,
                wait: 10,
                wait_max: None,
                x: 0,
                y: 0,
                options: vec![],
            }],
        },
    ];
    scheduler.on_talk_start(0, &talk_anims);
    scheduler.on_char_spoken(0, &talk_anims);
    scheduler.on_char_spoken(0, &talk_anims);
    scheduler.on_talk_end(0, &talk_anims);
    scheduler.on_script_end(0, &talk_anims);

    // 7. Exclusive with target stopping active animation
    let target_to_stop = SerikoAnimation {
        id: 50,
        name: None,
        interval: Some(Interval::Always),
        options: vec![],
        collisions: vec![],
        patterns: vec![AnimationPattern {
            index: 0,
            method: DrawMethod::Overlay,
            surface: 50,
            wait: 100,
            wait_max: None,
            x: 0,
            y: 0,
            options: vec![],
        }],
    };
    let excl_stopping = SerikoAnimation {
        id: 51,
        name: None,
        interval: Some(Interval::Always),
        options: vec![vec!["exclusive(50)".to_string()]],
        collisions: vec![],
        patterns: vec![AnimationPattern {
            index: 0,
            method: DrawMethod::Overlay,
            surface: 51,
            wait: 100,
            wait_max: None,
            x: 0,
            y: 0,
            options: vec![],
        }],
    };
    scheduler.stop_animations(0);
    scheduler.start_animation(0, 0, &target_to_stop);
    assert_eq!(scheduler.active_count(0), 1);
    scheduler.start_animation(0, 0, &excl_stopping);
}
