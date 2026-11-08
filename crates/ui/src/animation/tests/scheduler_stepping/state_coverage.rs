/**
 * @file state_coverage.rs
 * @brief AnimationScheduler の状態管理・フォールバック・shared-index エッジケース単体テスト
 */

use super::*;

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
