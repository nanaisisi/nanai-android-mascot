/**
 * @file pattern_control.rs
 * @brief パターン描画方式 (Start, Stop, Parallel, Alternative, Bind) ステップ実行単体テスト
 */
use super::*;

#[test]
fn test_animation_scheduler_stepping_and_control_methods() {
    let mut scheduler = AnimationScheduler::new();

    let anim_controller = SerikoAnimation::new(
        10,
        Some(Interval::RunOnce),
        None,
        vec![
            AnimationPattern::new(
                0,
                DrawMethod::Start(Some(20)),
                101,
                10,
                None,
                0,
                0,
                vec![],
            ),
            AnimationPattern::new(
                1,
                DrawMethod::Stop(Some(20)),
                102,
                10,
                None,
                0,
                0,
                vec![],
            ),
            AnimationPattern::new(
                2,
                DrawMethod::Overlay,
                103,
                10,
                None,
                0,
                0,
                vec![],
            ),
            AnimationPattern::new(
                3,
                DrawMethod::Replace,
                104,
                10,
                None,
                0,
                0,
                vec![],
            ),
            AnimationPattern::new(
                4,
                DrawMethod::Interpolate,
                105,
                10,
                None,
                0,
                0,
                vec![],
            ),
            AnimationPattern::new(
                5,
                DrawMethod::Add,
                106,
                10,
                None,
                0,
                0,
                vec![],
            ),
            AnimationPattern::new(
                6,
                DrawMethod::Bind,
                107,
                10,
                None,
                0,
                0,
                vec![],
            ),
        ],
        vec![],
        vec![],
    );

    let target_anim = SerikoAnimation::new(
        20,
        Some(Interval::Always),
        None,
        vec![AnimationPattern::new(
            0,
            DrawMethod::Overlay,
            200,
            50,
            None,
            0,
            0,
            vec![],
        )],
        vec![],
        vec![],
    );

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
    let anim = SerikoAnimation::new(
        100,
        Some(Interval::RunOnce),
        None,
        vec![
            AnimationPattern::new(
                0,
                DrawMethod::ParallelStart(vec![]),
                10,
                10,
                None,
                0,
                0,
                vec![],
            ),
            AnimationPattern::new(
                1,
                DrawMethod::ParallelStop(vec![]),
                11,
                10,
                None,
                0,
                0,
                vec![],
            ),
            AnimationPattern::new(
                2,
                DrawMethod::AlternativeStart(vec![]),
                12,
                10,
                None,
                0,
                0,
                vec![],
            ),
            AnimationPattern::new(
                3,
                DrawMethod::AlternativeStop(vec![]),
                13,
                10,
                None,
                0,
                0,
                vec![],
            ),
            AnimationPattern::new(
                4,
                DrawMethod::AlternativeStart(vec![10]),
                14,
                10,
                None,
                0,
                0,
                vec![],
            ),
            AnimationPattern::new(
                5,
                DrawMethod::AlternativeStop(vec![11]),
                15,
                10,
                None,
                0,
                0,
                vec![],
            ),
        ],
        vec![],
        vec![],
    );
    scheduler.start_animation(0, 0, &anim);
    let _ = scheduler.step(15);
    let _ = scheduler.step(15);
}

#[test]
fn test_stepping_catalog_missing_animation_id() {
    let mut scheduler = AnimationScheduler::new();
    let anim = SerikoAnimation::new(
        200,
        Some(Interval::RunOnce),
        None,
        vec![AnimationPattern::new(
            0,
            DrawMethod::Start(Some(9999)),
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
    scheduler.start_animation(0, 0, &anim);
    let non_matching_catalog = vec![SerikoAnimation::new(
        8888,
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
    )];
    let _ = scheduler.step_with_catalog(15, &non_matching_catalog);
}

#[test]
fn test_stepping_stop_others_retains_and_drops() {
    let mut scheduler = AnimationScheduler::new();
    let anim_stop = SerikoAnimation::new(
        50,
        Some(Interval::RunOnce),
        None,
        vec![AnimationPattern::new(
            0,
            DrawMethod::Overlay,
            -2,
            10,
            None,
            0,
            0,
            vec![],
        )],
        vec![],
        vec![],
    );
    let anim_normal = SerikoAnimation::new(
        51,
        Some(Interval::Always),
        None,
        vec![AnimationPattern::new(
            0,
            DrawMethod::Overlay,
            300,
            100,
            None,
            0,
            0,
            vec![],
        )],
        vec![],
        vec![],
    );
    scheduler.start_animation(0, 0, &anim_normal);
    scheduler.start_animation(0, 0, &anim_stop);
    assert_eq!(scheduler.active_count(0), 2);
    let _ = scheduler.step(15);
}
