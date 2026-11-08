/**
 * @file scaling_talking.rs
 * @brief Surface 拡大縮小 (Scaling) および SERIKO 発話を考慮したアニメーション制御単体テスト
 */
use super::*;

#[test]
fn test_animation_scheduler_scaling_and_talk_toggle() {
    use crate::surfaces::SerikoAnimation;

    let mut scheduler = AnimationScheduler::new();

    // scaling の初期値は (100.0, 100.0)
    assert_eq!(scheduler.get_base_scaling_offset(0), (100.0, 100.0));

    let scaling_anim = SerikoAnimation {
        id: 8,
        interval: Some(Interval::RunOnce),
        name: None,
        patterns: vec![
            AnimationPattern {
                index: 0,
                method: DrawMethod::Scaling,
                surface: 0,
                wait: 25,
                wait_max: None,
                x: 120,
                y: 130,
                options: vec![],
            },
            AnimationPattern {
                index: 1,
                method: DrawMethod::Scaling,
                surface: 0,
                wait: 25,
                wait_max: None,
                x: 100,
                y: 100,
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

    scheduler.start_animation(0, 0, &scaling_anim);
    assert_eq!(scheduler.active_count(0), 1);

    // pattern 0: scaling x=120, y=130
    let events = scheduler.step(25);
    assert_eq!(events.len(), 1);
    assert_eq!(events[0].pattern.method, DrawMethod::Scaling);
    assert_eq!(scheduler.get_base_scaling_offset(0), (120.0, 130.0));

    // pattern 1: scaling x=100, y=100 (元に戻す)
    let events2 = scheduler.step(25);
    assert_eq!(events2.len(), 1);
    assert_eq!(scheduler.get_base_scaling_offset(0), (100.0, 100.0));

    // 口パク有効化状態 (seriko_talk_enabled)
    assert!(scheduler.is_seriko_talk_enabled(0));
    scheduler.set_seriko_talk_enabled(0, false);
    assert!(!scheduler.is_seriko_talk_enabled(0));

    let talk_anim = SerikoAnimation {
        id: 99,
        interval: Some(Interval::Talk),
        name: None,
        patterns: vec![super::pattern(0, 10, 50)],
        collisions: vec![],
        options: vec![],
    };

    // seriko_talk_enabled が false の場合、on_char_spoken によるアニメーション開始が抑止される
    scheduler.on_char_spoken(0, std::slice::from_ref(&talk_anim));
    assert_eq!(scheduler.active_count(0), 1);

    scheduler.set_seriko_talk_enabled(0, true);
    scheduler.on_char_spoken(0, &[talk_anim]);
    assert!(scheduler.active_count(0) >= 2);

    // is_animation_running の検証
    assert!(scheduler.is_animation_running(0, 99));
    assert!(!scheduler.is_animation_running(0, 12345));
    assert!(!scheduler.is_animation_running(1, 99));
}
