/**
 * @file exclusive_blocking.rs
 * @brief exclusive (全体・ターゲット指定) 排他ブロックおよび停止動作単体テスト
 */
use super::*;

#[test]
fn test_exclusive_blocking_and_stopping() {
    let mut scheduler = AnimationScheduler::new();

    // 1. 空パターンのアニメーション開始 (即座にリターン)
    let empty_anim = SerikoAnimation {
        id: 1,
        name: None,
        interval: Some(Interval::Always),
        options: vec![],
        collisions: vec![],
        patterns: vec![],
    };
    scheduler.start_animation(0, 0, &empty_anim);
    assert_eq!(scheduler.active_count(0), 0);

    // 2. 全体排他 (exclusive) ブロック
    let excl_global = SerikoAnimation {
        id: 10,
        name: None,
        interval: Some(Interval::Always),
        options: vec![vec!["exclusive".to_string()]],
        collisions: vec![],
        patterns: vec![AnimationPattern {
            index: 0,
            method: DrawMethod::Overlay,
            surface: 100,
            wait: 100,
            wait_max: None,
            x: 0,
            y: 0,
            options: vec![],
        }],
    };
    let blocked_anim = SerikoAnimation {
        id: 11,
        name: None,
        interval: Some(Interval::Always),
        options: vec![],
        collisions: vec![],
        patterns: vec![AnimationPattern {
            index: 0,
            method: DrawMethod::Overlay,
            surface: 101,
            wait: 100,
            wait_max: None,
            x: 0,
            y: 0,
            options: vec![],
        }],
    };
    scheduler.start_animation(0, 0, &excl_global);
    assert!(scheduler.is_blocked_by_exclusive(0, 11));
    scheduler.start_animation(0, 0, &blocked_anim);

    // ターゲット指定排他 (exclusive(21))
    let excl_target = SerikoAnimation {
        id: 20,
        name: None,
        interval: Some(Interval::Always),
        options: vec![vec!["exclusive(21)".to_string()]],
        collisions: vec![],
        patterns: vec![AnimationPattern {
            index: 0,
            method: DrawMethod::Overlay,
            surface: 102,
            wait: 100,
            wait_max: None,
            x: 0,
            y: 0,
            options: vec![],
        }],
    };
    scheduler.stop_animations(0);
    scheduler.start_animation(0, 0, &excl_target);
    assert!(scheduler.is_blocked_by_exclusive(0, 21));
    assert!(!scheduler.is_blocked_by_exclusive(0, 22));

    // 一時停止状態での開始
    scheduler.pause_animation(0, 30);
    let paused_anim = SerikoAnimation {
        id: 30,
        name: None,
        interval: Some(Interval::Always),
        options: vec![],
        collisions: vec![],
        patterns: vec![AnimationPattern {
            index: 0,
            method: DrawMethod::Overlay,
            surface: 104,
            wait: 100,
            wait_max: None,
            x: 0,
            y: 0,
            options: vec![],
        }],
    };
    scheduler.start_animation(0, 0, &paused_anim);
    assert!(scheduler.is_animation_paused(0, 30));

    // 排他指定によるアクティブターゲットアニメーションの停止
    let target_to_stop = SerikoAnimation {
        id: 50,
        name: None,
        interval: Some(Interval::Always),
        options: vec![],
        collisions: vec![],
        patterns: vec![AnimationPattern {
            index: 0,
            method: DrawMethod::Overlay,
            surface: 50,
            wait: 100,
            wait_max: None,
            x: 0,
            y: 0,
            options: vec![],
        }],
    };
    let excl_stopping = SerikoAnimation {
        id: 51,
        name: None,
        interval: Some(Interval::Always),
        options: vec![vec!["exclusive(50)".to_string()]],
        collisions: vec![],
        patterns: vec![AnimationPattern {
            index: 0,
            method: DrawMethod::Overlay,
            surface: 51,
            wait: 100,
            wait_max: None,
            x: 0,
            y: 0,
            options: vec![],
        }],
    };
    scheduler.stop_animations(0);
    scheduler.start_animation(0, 0, &target_to_stop);
    assert_eq!(scheduler.active_count(0), 1);
    scheduler.start_animation(0, 0, &excl_stopping);
}
