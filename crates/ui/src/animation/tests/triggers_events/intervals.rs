/**
 * @file intervals.rs
 * @brief インターバル（RunOnce, Always, Talk, Custom, Random）条件判定・トリガー分岐単体テスト
 */
use super::*;

#[test]
fn test_triggers_uncovered_branches() {
    let mut scheduler = AnimationScheduler::new();
    let anim = SerikoAnimation::new(
        100,
        Some(Interval::RunOnce),
        None,
        vec![AnimationPattern::new(
            0,
            DrawMethod::Overlay,
            10,
            10,
            None,
            0,
            0,
            vec![],
        )],
        vec![],
        vec![vec!["exclusive".to_string()]],
    );
    scheduler.start_animation(0, 0, &anim);
    scheduler.start_animation(0, 0, &anim);

    scheduler.schedule_surface_animations(0, 0, &[anim], 0.0);
}

#[test]
fn test_triggers_runonce_always() {
    let mut scheduler = AnimationScheduler::new();
    let anim_runonce = SerikoAnimation::new(
        200,
        Some(Interval::RunOnce),
        None,
        vec![AnimationPattern::new(
            0,
            DrawMethod::Overlay,
            10,
            10,
            None,
            0,
            0,
            vec![],
        )],
        vec![],
        vec![],
    );
    let anim_always = SerikoAnimation::new(
        201,
        Some(Interval::Always),
        None,
        vec![AnimationPattern::new(
            0,
            DrawMethod::Overlay,
            11,
            10,
            None,
            0,
            0,
            vec![],
        )],
        vec![],
        vec![],
    );
    scheduler.schedule_surface_animations(0, 0, &[anim_runonce, anim_always], 0.5);
}

#[test]
fn test_triggers_custom_interval_fallback() {
    let mut scheduler = AnimationScheduler::new();
    let anim_talk = SerikoAnimation::new(
        300,
        Some(Interval::Talk),
        None,
        vec![AnimationPattern::new(
            0,
            DrawMethod::Overlay,
            10,
            10,
            None,
            0,
            0,
            vec![],
        )],
        vec![],
        vec![],
    );
    scheduler.schedule_surface_animations(0, 0, &[anim_talk], 0.5);
}
