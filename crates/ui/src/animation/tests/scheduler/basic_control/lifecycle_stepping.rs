/**
 * @file lifecycle_stepping.rs
 * @brief AnimationScheduler の基本登録、ステップ進行、一時停止/再開、停止/オフセット単体テスト
 */
use super::*;

#[test]
fn test_animation_scheduler_basic() {
    use crate::surfaces_core_integration::SerikoAnimation;

    let mut scheduler = AnimationScheduler::new();
    scheduler.set_surface(0, 0);
    assert_eq!(scheduler.current_surface(0), 0);
    assert_eq!(scheduler.current_surface(1), 10);

    let anim = SerikoAnimation::new(
        1,
        Some(Interval::RunOnce),
        None,
        vec![
            super::pattern(PatternParams::new(0, 101, 50)),
            super::pattern(PatternParams::new(1, 102, 50)),
            super::pattern(PatternParams::new(2, -1, 0)),
        ],
        vec![],
        vec![],
    );

    scheduler.schedule_surface_animations(0, 0, std::slice::from_ref(&anim), 0.0);
    assert_eq!(scheduler.active_count(0), 1);

    // 0ms時点
    let events = scheduler.step(0);
    assert!(events.is_empty());

    // 50ms経過で1フレーム目
    let events = scheduler.step(50);
    assert_eq!(events.len(), 1);
    assert_eq!(events[0].pattern.surface(), 101);
    assert!(!events[0].is_finished);

    // さらに50ms経過で2フレーム目
    let events = scheduler.step(50);
    assert_eq!(events.len(), 1);
    assert_eq!(events[0].pattern.surface(), 102);
    assert!(!events[0].is_finished);

    // さらに0msで3フレーム目（surface -1 到達で終了）
    let events = scheduler.step(0);
    assert_eq!(events.len(), 1);
    assert_eq!(events[0].pattern.surface(), -1);
    assert!(events[0].is_finished);
    assert_eq!(scheduler.active_count(0), 0);
}

#[test]
fn test_animation_scheduler_pause_resume() {
    use crate::surfaces_core_integration::SerikoAnimation;

    let mut scheduler = AnimationScheduler::new();
    let anim = SerikoAnimation::new(
        5,
        Some(Interval::Always),
        None,
        vec![super::pattern(PatternParams::new(0, 10, 100))],
        vec![],
        vec![],
    );

    scheduler.start_animation(0, 0, &anim);
    assert_eq!(scheduler.active_count(0), 1);

    scheduler.pause_animation(0, 5);
    assert_eq!(scheduler.active_animation_ids(0), vec![5]);
    assert_eq!(scheduler.active_animation_ids(1), Vec::<u32>::new());
    assert!(scheduler.is_animation_paused(0, 5));

    let events = scheduler.step(200);
    assert!(events.is_empty());

    scheduler.resume_animation(0, 5);
    assert!(!scheduler.is_animation_paused(0, 5));

    let events = scheduler.step(100);
    assert_eq!(events.len(), 1);
    assert_eq!(events[0].pattern.surface(), 10);
}

#[test]
fn test_animation_scheduler_stop_and_offset() {
    use crate::surfaces_core_integration::SerikoAnimation;

    let mut scheduler = AnimationScheduler::new();

    let anim1 = SerikoAnimation::new(
        10,
        Some(Interval::Always),
        Some("test_anim".to_string()),
        vec![
            super::pattern(PatternParams::new(0, 100, 50)),
            super::pattern(PatternParams::new(1, 101, 50)),
        ],
        vec![],
        vec![],
    );
    let anim2 = SerikoAnimation::new(
        20,
        Some(Interval::Always),
        Some("other_anim".to_string()),
        vec![super::pattern(PatternParams::new(0, 200, 50))],
        vec![],
        vec![],
    );

    scheduler.start_animation(0, 0, &anim1);
    scheduler.start_animation(0, 0, &anim2);
    assert_eq!(scheduler.active_count(0), 2);

    // オフセット設定のテスト
    scheduler.set_animation_offset(0, 10, 15, -20);
    scheduler.set_animation_offset(0, 20, 5, 5);

    // 特定のIDで停止
    scheduler.stop_animation(0, 10);
    assert_eq!(scheduler.active_count(0), 1);
    assert_eq!(scheduler.active_animation_ids(0), vec![20]);

    // 全停止
    scheduler.start_animation(0, 0, &anim1);
    scheduler.start_animation(0, 0, &anim2);
    scheduler.stop_animations(0);
    assert_eq!(scheduler.active_count(0), 0);
}
