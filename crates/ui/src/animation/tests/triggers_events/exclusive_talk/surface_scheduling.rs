/**
 * @file surface_scheduling.rs
 * @brief schedule_surface_animations によるインターバル別サーフィスアニメーション自動登録単体テスト
 */

use super::*;

#[test]
fn test_schedule_surface_animations() {
    let mut scheduler = AnimationScheduler::new();

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
}
