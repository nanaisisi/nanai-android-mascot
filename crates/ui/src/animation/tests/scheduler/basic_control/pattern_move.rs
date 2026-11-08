/**
 * @file pattern_move.rs
 * @brief パターン連動アニメーション開始/停止制御および Move 描画方式単体テスト
 */

use super::*;

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
    assert_eq!(scheduler.active_count(0), 2);

    // pattern 1 (Stop(10)) に到達すると target_anim (ID=10) が停止される
    let events2 = scheduler.step_with_catalog(50, &catalog);
    assert!(!events2.is_empty());
    assert_eq!(scheduler.active_count(0), 1);
}

#[test]
fn test_animation_scheduler_move_draw_method() {
    use crate::surfaces::SerikoAnimation;

    let mut scheduler = AnimationScheduler::new();

    let move_anim = SerikoAnimation {
        id: 7,
        interval: Some(Interval::RunOnce),
        name: None,
        patterns: vec![
            AnimationPattern {
                index: 0,
                method: DrawMethod::Move,
                surface: 0,
                wait: 30,
                wait_max: None,
                x: 15,
                y: -20,
                options: vec![],
            },
            AnimationPattern {
                index: 1,
                method: DrawMethod::Move,
                surface: 0,
                wait: 40,
                wait_max: None,
                x: 0,
                y: 0,
                options: vec![],
            },
            AnimationPattern {
                index: 2,
                method: DrawMethod::Overlay,
                surface: -1,
                wait: 0,
                wait_max: None,
                x: 0,
                y: 0,
                options: vec![],
            },
        ],
        collisions: vec![],
        options: vec![],
    };

    assert_eq!(scheduler.get_base_move_offset(0), (0, 0));

    scheduler.start_animation(0, 0, &move_anim);
    assert_eq!(scheduler.active_count(0), 1);

    // pattern 0: move x=15, y=-20
    let events = scheduler.step(30);
    assert_eq!(events.len(), 1);
    assert_eq!(events[0].pattern.method, DrawMethod::Move);
    assert_eq!(scheduler.get_base_move_offset(0), (15, -20));

    // pattern 1: move x=0, y=0 (位置復帰)
    let events2 = scheduler.step(40);
    assert_eq!(events2.len(), 1);
    assert_eq!(scheduler.get_base_move_offset(0), (0, 0));

    // pattern 2: -1 終了
    let events3 = scheduler.step(0);
    assert_eq!(events3.len(), 1);
    assert_eq!(scheduler.active_count(0), 0);
}
