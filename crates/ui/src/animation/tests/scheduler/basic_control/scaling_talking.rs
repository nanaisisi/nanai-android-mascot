/**
 * @file scaling_talking.rs
 * @brief Surface 拡大縮小 (Scaling) および SERIKO 発話を考慮したアニメーション制御単体テスト
 */
use super::*;

#[test]
fn test_animation_scheduler_scaling_and_talk_toggle() {
    use crate::surfaces_core_integration::SerikoAnimation;

    let mut scheduler = AnimationScheduler::new();

    // scaling の初期値は (100.0, 100.0)
    assert_eq!(scheduler.get_base_scaling_offset(0), (100.0, 100.0));

    let scaling_anim = SerikoAnimation::new(
        8,
        Some(Interval::RunOnce),
        None,
        vec![
            AnimationPattern::new(0, DrawMethod::Scaling, 0, 25, None, 120, 130, vec![]),
            AnimationPattern::new(1, DrawMethod::Scaling, 0, 25, None, 100, 100, vec![]),
            AnimationPattern::new(2, DrawMethod::Overlay, -1, 0, None, 0, 0, vec![]),
        ],
        vec![],
        vec![],
    );

    scheduler.start_animation(0, 0, &scaling_anim);
    assert_eq!(scheduler.active_count(0), 1);

    // pattern 0: scaling x=120, y=130
    let events = scheduler.step(25);
    assert_eq!(events.len(), 1);
    assert_eq!(events[0].pattern.method(), &DrawMethod::Scaling);
    assert_eq!(scheduler.get_base_scaling_offset(0), (120.0, 130.0));

    // pattern 1: scaling x=100, y=100 (元に戻す)
    let events2 = scheduler.step(25);
    assert_eq!(events2.len(), 1);
    assert_eq!(scheduler.get_base_scaling_offset(0), (100.0, 100.0));

    // 口パク有効化状態 (seriko_talk_enabled)
    assert!(scheduler.is_seriko_talk_enabled(0));
    scheduler.set_seriko_talk_enabled(0, false);
    assert!(!scheduler.is_seriko_talk_enabled(0));

    let talk_anim = SerikoAnimation::new(
        99,
        Some(Interval::Talk),
        None,
        vec![super::pattern(PatternParams::new(0, 10, 50))],
        vec![],
        vec![],
    );

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
