/**
 * @file exclusive_blocking.rs
 * @brief exclusive (全体・ターゲット指定) 排他ブロックおよび停止動作単体テスト
 */
use super::*;

#[test]
fn test_exclusive_blocking_and_stopping() {
    let mut scheduler = AnimationScheduler::new();

    // 1. 空パターンのアニメーション開始 (即座にリターン)
    let empty_anim = SerikoAnimation::new(
        1,
        Some(Interval::Always),
        None,
        vec![],
        vec![],
        vec![],
    );
    scheduler.start_animation(0, 0, &empty_anim);
    assert_eq!(scheduler.active_count(0), 0);

    // 2. 全体排他 (exclusive) ブロック
    let excl_global = SerikoAnimation::new(
        10,
        Some(Interval::Always),
        None,
        vec![AnimationPattern::new(
            0,
            DrawMethod::Overlay,
            100,
            100,
            None,
            0,
            0,
            vec![],
        )],
        vec![],
        vec![vec!["exclusive".to_string()]],
    );
    let blocked_anim = SerikoAnimation::new(
        11,
        Some(Interval::Always),
        None,
        vec![AnimationPattern::new(
            0,
            DrawMethod::Overlay,
            101,
            100,
            None,
            0,
            0,
            vec![],
        )],
        vec![],
        vec![],
    );
    scheduler.start_animation(0, 0, &excl_global);
    assert!(scheduler.is_blocked_by_exclusive(0, 11));
    scheduler.start_animation(0, 0, &blocked_anim);

    // ターゲット指定排他 (exclusive(21))
    let excl_target = SerikoAnimation::new(
        20,
        Some(Interval::Always),
        None,
        vec![AnimationPattern::new(
            0,
            DrawMethod::Overlay,
            102,
            100,
            None,
            0,
            0,
            vec![],
        )],
        vec![],
        vec![vec!["exclusive(21)".to_string()]],
    );
    scheduler.stop_animations(0);
    scheduler.start_animation(0, 0, &excl_target);
    assert!(scheduler.is_blocked_by_exclusive(0, 21));
    assert!(!scheduler.is_blocked_by_exclusive(0, 22));

    // 一時停止状態での開始
    scheduler.pause_animation(0, 30);
    let paused_anim = SerikoAnimation::new(
        30,
        Some(Interval::Always),
        None,
        vec![AnimationPattern::new(
            0,
            DrawMethod::Overlay,
            104,
            100,
            None,
            0,
            0,
            vec![],
        )],
        vec![],
        vec![],
    );
    scheduler.start_animation(0, 0, &paused_anim);
    assert!(scheduler.is_animation_paused(0, 30));

    // 排他指定によるアクティブターゲットアニメーションの停止
    let target_to_stop = SerikoAnimation::new(
        50,
        Some(Interval::Always),
        None,
        vec![AnimationPattern::new(
            0,
            DrawMethod::Overlay,
            50,
            100,
            None,
            0,
            0,
            vec![],
        )],
        vec![],
        vec![],
    );
    let excl_stopping = SerikoAnimation::new(
        51,
        Some(Interval::Always),
        None,
        vec![AnimationPattern::new(
            0,
            DrawMethod::Overlay,
            51,
            100,
            None,
            0,
            0,
            vec![],
        )],
        vec![],
        vec![vec!["exclusive(50)".to_string()]],
    );
    scheduler.stop_animations(0);
    scheduler.start_animation(0, 0, &target_to_stop);
    assert_eq!(scheduler.active_count(0), 1);
    scheduler.start_animation(0, 0, &excl_stopping);
}
