/**
 * @file pattern_move.rs
 * @brief パターン連動アニメーション開始/停止制御および Move 描画方式単体テスト
 */
use super::*;

#[test]
fn test_animation_scheduler_pattern_control_methods() {
    use crate::surfaces_core_integration::SerikoAnimation;

    let mut scheduler = AnimationScheduler::new();

    let target_anim = SerikoAnimation::new(
        10,
        Some(Interval::Never),
        None,
        vec![
            super::pattern(PatternParams::new(0, 501, 100)),
            super::pattern(PatternParams::new(1, 502, 100)),
            super::pattern(PatternParams::new(2, -1, 100)),
        ],
        vec![],
        vec![],
    );

    let controller_anim = SerikoAnimation::new(
        1,
        Some(Interval::RunOnce),
        None,
        vec![
            AnimationPattern::new(
                0,
                DrawMethod::Start(Some(10)),
                10,
                10,
                None,
                0,
                0,
                vec![],
            ),
            AnimationPattern::new(
                1,
                DrawMethod::Stop(Some(10)),
                10,
                50,
                None,
                0,
                0,
                vec![],
            ),
            AnimationPattern::new(
                2,
                DrawMethod::Overlay,
                -1,
                100,
                None,
                0,
                0,
                vec![],
            ),
        ],
        vec![],
        vec![],
    );

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
    use crate::surfaces_core_integration::SerikoAnimation;

    let mut scheduler = AnimationScheduler::new();

    let move_anim = SerikoAnimation::new(
        7,
        Some(Interval::RunOnce),
        None,
        vec![
            AnimationPattern::new(
                0,
                DrawMethod::Move,
                0,
                30,
                None,
                15,
                -20,
                vec![],
            ),
            AnimationPattern::new(
                1,
                DrawMethod::Move,
                0,
                40,
                None,
                0,
                0,
                vec![],
            ),
            AnimationPattern::new(
                2,
                DrawMethod::Overlay,
                -1,
                0,
                None,
                0,
                0,
                vec![],
            ),
        ],
        vec![],
        vec![],
    );

    assert_eq!(scheduler.get_base_move_offset(0), (0, 0));

    scheduler.start_animation(0, 0, &move_anim);
    assert_eq!(scheduler.active_count(0), 1);

    // pattern 0: move x=15, y=-20
    let events = scheduler.step(30);
    assert_eq!(events.len(), 1);
    assert_eq!(events[0].pattern.method(), &DrawMethod::Move);
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
