/**
 * @file intervals.rs
 * @brief インターバル（RunOnce, Always, Talk, Custom, Random）条件判定・トリガー分岐単体テスト
 */
use super::*;

#[test]
fn test_triggers_uncovered_branches() {
    let mut scheduler = AnimationScheduler::new();
    let anim = SerikoAnimation {
        id: 100,
        name: None,
        interval: Some(Interval::RunOnce),
        options: vec![vec!["exclusive".to_string()]],
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
    };
    scheduler.start_animation(0, 0, &anim);
    scheduler.start_animation(0, 0, &anim);

    scheduler.schedule_surface_animations(0, 0, &[anim], 0.0);
}

#[test]
fn test_triggers_runonce_always() {
    let mut scheduler = AnimationScheduler::new();
    let anim_runonce = SerikoAnimation {
        id: 200,
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
    };
    let anim_always = SerikoAnimation {
        id: 201,
        name: None,
        interval: Some(Interval::Always),
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
    };
    scheduler.schedule_surface_animations(0, 0, &[anim_runonce, anim_always], 0.5);
}

#[test]
fn test_triggers_custom_interval_fallback() {
    let mut scheduler = AnimationScheduler::new();
    let anim_talk = SerikoAnimation {
        id: 300,
        name: None,
        interval: Some(Interval::Talk),
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
    };
    scheduler.schedule_surface_animations(0, 0, &[anim_talk], 0.5);
}
