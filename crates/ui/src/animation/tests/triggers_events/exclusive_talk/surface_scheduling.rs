/**
 * @file surface_scheduling.rs
 * @brief schedule_surface_animations によるインターバル別サーフィスアニメーション自動登録単体テスト
 */
use super::*;

#[test]
fn test_schedule_surface_animations() {
    let mut scheduler = AnimationScheduler::new();

    let anims = vec![
        SerikoAnimation::new(
            1,
            Some(Interval::Never),
            None,
            vec![AnimationPattern::new(
                0,
                DrawMethod::Overlay,
                1,
                10,
                None,
                0,
                0,
                vec![],
            )],
            vec![],
            vec![],
        ),
        SerikoAnimation::new(
            2,
            Some(Interval::Bind),
            None,
            vec![AnimationPattern::new(
                0,
                DrawMethod::Overlay,
                2,
                10,
                None,
                0,
                0,
                vec![],
            )],
            vec![],
            vec![],
        ),
        SerikoAnimation::new(
            3,
            Some(Interval::RunOnce),
            None,
            vec![AnimationPattern::new(
                0,
                DrawMethod::Overlay,
                3,
                10,
                None,
                0,
                0,
                vec![],
            )],
            vec![],
            vec![],
        ),
        SerikoAnimation::new(
            4,
            Some(Interval::Sometimes),
            None,
            vec![AnimationPattern::new(
                0,
                DrawMethod::Overlay,
                4,
                10,
                None,
                0,
                0,
                vec![],
            )],
            vec![],
            vec![],
        ),
    ];

    scheduler.set_bind_active(0, 2, true);
    scheduler.schedule_surface_animations(0, 0, &anims, 0.0);
    scheduler.schedule_surface_animations(0, 0, &anims, 1.0);
}
