use super::*;

#[test]
fn test_animation_scheduler_talk_and_bind() {
    use crate::surfaces::SerikoAnimation;

    let mut scheduler = AnimationScheduler::new();
    let talk_anim = SerikoAnimation {
        id: 1,
        interval: Some(Interval::Custom("talk,2".into())),
        name: None,
        patterns: vec![super::pattern(0, 20, 0)],
        collisions: vec![],
        options: vec![],
    };
    let start_anim = SerikoAnimation {
        id: 2,
        interval: Some(Interval::StartTalk),
        name: None,
        patterns: vec![super::pattern(0, 21, 0)],
        collisions: vec![],
        options: vec![],
    };
    let end_anim = SerikoAnimation {
        id: 3,
        interval: Some(Interval::EndTalk),
        name: None,
        patterns: vec![super::pattern(0, 22, 0)],
        collisions: vec![],
        options: vec![],
    };
    let bind_anim = SerikoAnimation {
        id: 4,
        interval: Some(Interval::Bind),
        name: None,
        patterns: vec![super::pattern(0, 23, 0)],
        collisions: vec![],
        options: vec![],
    };

    let anims = vec![
        talk_anim.clone(),
        start_anim.clone(),
        end_anim.clone(),
        bind_anim.clone(),
    ];

    // bindが無効な時はスケジュールされない
    scheduler.schedule_surface_animations(0, 0, &anims, 0.0);
    assert_eq!(scheduler.active_count(0), 0);

    // bind有効化
    scheduler.set_bind_active(0, 4, true);
    assert!(scheduler.is_bind_active(0, 4));
    scheduler.schedule_surface_animations(0, 0, &anims, 0.0);

    // 発話トリガー
    scheduler.on_char_spoken(0, &anims); // 1文字目: starttalk発火、talk,2は未発火
    let events = scheduler.step(0);
    assert!(events.iter().any(|e| e.animation_id == 2));

    scheduler.on_char_spoken(0, &anims); // 2文字目: talk,2発火
    let events = scheduler.step(0);
    assert!(events.iter().any(|e| e.animation_id == 1));

    scheduler.on_talk_end(0, &anims); // 発話終了: endtalk発火
    let events = scheduler.step(0);
    assert!(events.iter().any(|e| e.animation_id == 3));

    // yen-e
    let yene_anim = SerikoAnimation {
        id: 9,
        interval: Some(Interval::YenE),
        name: None,
        patterns: vec![super::pattern(0, 99, 0)],
        collisions: vec![],
        options: vec![],
    };
    scheduler.on_script_end(0, &[yene_anim]);
    let events = scheduler.step(0);
    assert!(events.iter().any(|e| e.animation_id == 9));
}

#[test]
fn test_animation_scheduler_exclusive_and_background() {
    use crate::surfaces::SerikoAnimation;

    let mut scheduler = AnimationScheduler::new();

    // 通常アニメーション 1
    let normal_anim = SerikoAnimation {
        id: 1,
        interval: Some(Interval::Always),
        name: None,
        patterns: vec![super::pattern(0, 101, 100), super::pattern(1, -1, 0)],
        collisions: vec![],
        options: vec![],
    };

    // background アニメーション 2
    let bg_anim = SerikoAnimation {
        id: 2,
        interval: Some(Interval::Always),
        name: None,
        patterns: vec![super::pattern(0, 102, 100), super::pattern(1, -1, 0)],
        collisions: vec![],
        options: vec![vec!["background".into()]],
    };

    // exclusive (全対象) アニメーション 3
    let exclusive_anim = SerikoAnimation {
        id: 3,
        interval: Some(Interval::RunOnce),
        name: None,
        patterns: vec![super::pattern(0, 103, 100), super::pattern(1, -1, 0)],
        collisions: vec![],
        options: vec![vec!["exclusive".into()]],
    };

    scheduler.start_animation(0, 0, &normal_anim);
    scheduler.start_animation(0, 0, &bg_anim);
    assert_eq!(scheduler.active_count(0), 2);

    let events = scheduler.step(100);
    assert_eq!(events.len(), 2);
    let bg_ev = events.iter().find(|e| e.animation_id == 2).unwrap();
    assert!(bg_ev.is_background);

    // exclusive アニメーション開始 -> 他の全アニメーションが停止される
    scheduler.start_animation(0, 0, &exclusive_anim);
    assert_eq!(scheduler.active_count(0), 1);

    // exclusive 実行中は新規アニメーションの開始がブロックされる
    assert!(scheduler.is_blocked_by_exclusive(0, 1));
    scheduler.start_animation(0, 0, &normal_anim);
    assert_eq!(scheduler.active_count(0), 1);

    // exclusive アニメーション: 1フレーム目(100ms) -> 2フレーム目(surface -1) で終了
    let _ = scheduler.step(100); // 1フレーム目 (pattern 0, surface 103)
    assert_eq!(scheduler.active_count(0), 1);
    let _ = scheduler.step(0); // 2フレーム目 (pattern 1, surface -1 で終了)
    assert_eq!(scheduler.active_count(0), 0);
    assert!(!scheduler.is_blocked_by_exclusive(0, 1));

    // exclusive 終了後は通常アニメーションが開始できる
    scheduler.start_animation(0, 0, &normal_anim);
    assert_eq!(scheduler.active_count(0), 1);
}

#[test]
fn test_animation_scheduler_exclusive_selective_targets() {
    use crate::surfaces::SerikoAnimation;

    let mut scheduler = AnimationScheduler::new();

    let anim1 = SerikoAnimation {
        id: 1,
        interval: Some(Interval::Always),
        name: None,
        patterns: vec![super::pattern(0, 101, 100)],
        collisions: vec![],
        options: vec![],
    };
    let anim2 = SerikoAnimation {
        id: 2,
        interval: Some(Interval::Always),
        name: None,
        patterns: vec![super::pattern(0, 102, 100)],
        collisions: vec![],
        options: vec![],
    };

    // ID=1 のみを対象とする exclusive アニメーション
    let anim3 = SerikoAnimation {
        id: 3,
        interval: Some(Interval::RunOnce),
        name: None,
        patterns: vec![super::pattern(0, 103, 100)],
        collisions: vec![],
        options: vec![vec!["exclusive,(1)".into()]],
    };

    scheduler.start_animation(0, 0, &anim1);
    scheduler.start_animation(0, 0, &anim2);
    assert_eq!(scheduler.active_count(0), 2);

    scheduler.start_animation(0, 0, &anim3);
    // anim1 は停止されるが、anim2 は生き残る
    assert!(scheduler.is_blocked_by_exclusive(0, 1));
    assert!(!scheduler.is_blocked_by_exclusive(0, 2));
}

#[test]
fn test_animation_scheduler_shared_index() {
    use crate::surfaces::SerikoAnimation;

    let mut scheduler = AnimationScheduler::new();

    // サーフィス0側のアニメーション
    let anim_s0 = SerikoAnimation {
        id: 10,
        interval: Some(Interval::RunOnce),
        name: None,
        patterns: vec![
            super::pattern(0, 200, 50),
            super::pattern(1, 201, 50),
            super::pattern(2, 202, 50),
        ],
        collisions: vec![],
        options: vec![vec!["shared-index".into()]],
    };

    // サーフィス1側のアニメーション
    let anim_s1 = SerikoAnimation {
        id: 10,
        interval: Some(Interval::RunOnce),
        name: None,
        patterns: vec![
            super::pattern(0, 300, 50),
            super::pattern(1, 301, 50),
            super::pattern(2, 302, 50),
        ],
        collisions: vec![],
        options: vec![vec!["shared-index".into()]],
    };

    scheduler.start_animation(0, 0, &anim_s0);
    // 1フレーム進める (index 0 -> index 1)
    let events = scheduler.step(50);
    assert_eq!(events[0].pattern.surface, 200);

    // サーフィス切替 (0 -> 1)
    scheduler.set_surface_with_shared_index(0, 1, &[anim_s1]);
    assert_eq!(scheduler.current_surface(0), 1);
    assert_eq!(scheduler.active_count(0), 1);

    // 次のフレーム進行で、新サーフィス1側の index 1 (surface 301) が再生されることを検証
    let events = scheduler.step(50);
    assert_eq!(events.len(), 1);
    assert_eq!(events[0].pattern.surface, 301);
}
