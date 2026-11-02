use super::*;

#[test]
fn test_animation_scheduler_basic() {
    use crate::surfaces::SerikoAnimation;

    let mut scheduler = AnimationScheduler::new();
    scheduler.set_surface(0, 0);
    assert_eq!(scheduler.current_surface(0), 0);
    assert_eq!(scheduler.current_surface(1), 10);

    let anim = SerikoAnimation {
        id: 1,
        interval: Some(Interval::RunOnce),
        name: None,
        patterns: vec![
            super::pattern(0, 101, 50),
            super::pattern(1, 102, 50),
            super::pattern(2, -1, 0),
        ],
        collisions: vec![],
        options: vec![],
    };

    scheduler.schedule_surface_animations(0, 0, std::slice::from_ref(&anim), 0.0);
    assert_eq!(scheduler.active_count(0), 1);

    // 0ms時点
    let events = scheduler.step(0);
    assert!(events.is_empty());

    // 50ms経過で1フレーム目
    let events = scheduler.step(50);
    assert_eq!(events.len(), 1);
    assert_eq!(events[0].pattern.surface, 101);
    assert!(!events[0].is_finished);

    // さらに50ms経過で2フレーム目
    let events = scheduler.step(50);
    assert_eq!(events.len(), 1);
    assert_eq!(events[0].pattern.surface, 102);
    assert!(!events[0].is_finished);

    // さらに0msで3フレーム目（surface -1 到達で終了）
    let events = scheduler.step(0);
    assert_eq!(events.len(), 1);
    assert_eq!(events[0].pattern.surface, -1);
    assert!(events[0].is_finished);
    assert_eq!(scheduler.active_count(0), 0);
}

#[test]
fn test_animation_scheduler_pause_resume() {
    use crate::surfaces::SerikoAnimation;

    let mut scheduler = AnimationScheduler::new();
    let anim = SerikoAnimation {
        id: 5,
        interval: Some(Interval::Always),
        name: None,
        patterns: vec![super::pattern(0, 10, 100)],
        collisions: vec![],
        options: vec![],
    };

    scheduler.start_animation(0, 0, &anim);
    assert_eq!(scheduler.active_count(0), 1);

    scheduler.pause_animation(0, 5);
    assert!(scheduler.is_animation_paused(0, 5));

    let events = scheduler.step(200);
    assert!(events.is_empty());

    scheduler.resume_animation(0, 5);
    assert!(!scheduler.is_animation_paused(0, 5));

    let events = scheduler.step(100);
    assert_eq!(events.len(), 1);
    assert_eq!(events[0].pattern.surface, 10);
}

#[test]
fn test_animation_scheduler_stop_and_offset() {
    use crate::surfaces::SerikoAnimation;

    let mut scheduler = AnimationScheduler::new();

    let anim1 = SerikoAnimation {
        id: 10,
        interval: Some(Interval::Always),
        name: Some("test_anim".to_string()),
        patterns: vec![super::pattern(0, 100, 50), super::pattern(1, 101, 50)],
        collisions: vec![],
        options: vec![],
    };
    let anim2 = SerikoAnimation {
        id: 20,
        interval: Some(Interval::Always),
        name: None,
        patterns: vec![super::pattern(0, 200, 50), super::pattern(1, 201, 50)],
        collisions: vec![],
        options: vec![],
    };

    // 動的オフセットを設定
    scheduler.set_animation_offset(0, 10, 40, -25);
    assert_eq!(scheduler.get_animation_offset(0, 10), (40, -25));
    assert_eq!(scheduler.get_animation_offset(0, 20), (0, 0));

    scheduler.start_animation(0, 0, &anim1);
    scheduler.start_animation(0, 0, &anim2);
    assert_eq!(scheduler.active_count(0), 2);

    let events = scheduler.step(50);
    assert_eq!(events.len(), 2);
    let ev1 = events.iter().find(|e| e.animation_id == 10).unwrap();
    let ev2 = events.iter().find(|e| e.animation_id == 20).unwrap();
    assert_eq!(ev1.offset_x, 40);
    assert_eq!(ev1.offset_y, -25);
    assert_eq!(ev2.offset_x, 0);
    assert_eq!(ev2.offset_y, 0);

    // stop_animation で ID=10 のみ停止
    scheduler.stop_animation(0, 10);
    assert_eq!(scheduler.active_count(0), 1);

    // 次フレームで ID=20 のみステップされる
    let events2 = scheduler.step(50);
    assert_eq!(events2.len(), 1);
    assert_eq!(events2[0].animation_id, 20);

    // サーフィス切り替えでオフセットがクリアされることを確認
    scheduler.set_surface(0, 1);
    assert_eq!(scheduler.get_animation_offset(0, 10), (0, 0));
}

#[test]
fn test_animation_scheduler_pattern_control_methods() {
    use crate::surfaces::SerikoAnimation;

    let mut scheduler = AnimationScheduler::new();

    let target_anim = SerikoAnimation {
        id: 10,
        interval: Some(Interval::Never),
        name: None,
        patterns: vec![
            super::pattern(0, 501, 100),
            super::pattern(1, 502, 100),
            super::pattern(2, -1, 100),
        ],
        collisions: vec![],
        options: vec![],
    };

    let controller_anim = SerikoAnimation {
        id: 1,
        interval: Some(Interval::RunOnce),
        name: None,
        patterns: vec![
            AnimationPattern {
                index: 0,
                method: DrawMethod::Start(Some(10)),
                surface: 10,
                wait: 10,
                wait_max: None,
                x: 0,
                y: 0,
                options: vec![],
            },
            AnimationPattern {
                index: 1,
                method: DrawMethod::Stop(Some(10)),
                surface: 10,
                wait: 50,
                wait_max: None,
                x: 0,
                y: 0,
                options: vec![],
            },
            AnimationPattern {
                index: 2,
                method: DrawMethod::Overlay,
                surface: -1,
                wait: 100,
                wait_max: None,
                x: 0,
                y: 0,
                options: vec![],
            },
        ],
        collisions: vec![],
        options: vec![],
    };

    let catalog = vec![target_anim, controller_anim.clone()];

    // controller_anim を開始
    scheduler.start_animation(0, 0, &controller_anim);
    assert_eq!(scheduler.active_count(0), 1);

    // pattern 0 (Start(10)) が進むと target_anim (ID=10) が自動的に catalog から開始される
    let events = scheduler.step_with_catalog(10, &catalog);
    assert!(!events.is_empty());
    assert_eq!(scheduler.active_count(0), 2); // controller + target

    // pattern 1 (Stop(10)) に到達すると target_anim (ID=10) が停止される
    let events2 = scheduler.step_with_catalog(50, &catalog);
    assert!(!events2.is_empty());
    assert_eq!(scheduler.active_count(0), 1); // target は停止
}
