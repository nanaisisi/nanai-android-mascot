use super::*;

#[test]
fn test_animation_scheduler_talk_and_bind() {
    use crate::surfaces_core_integration::SerikoAnimation;

    let mut scheduler = AnimationScheduler::new();
    let talk_anim = SerikoAnimation::new(
        1,
        Some(Interval::Custom("talk,2".into())),
        None,
        vec![super::pattern(PatternParams::new(0, 20, 0))],
        vec![],
        vec![],
    );
    let start_anim = SerikoAnimation::new(
        2,
        Some(Interval::StartTalk),
        None,
        vec![super::pattern(PatternParams::new(0, 21, 0))],
        vec![],
        vec![],
    );
    let end_anim = SerikoAnimation::new(
        3,
        Some(Interval::EndTalk),
        None,
        vec![super::pattern(PatternParams::new(0, 22, 0))],
        vec![],
        vec![],
    );
    let bind_anim = SerikoAnimation::new(
        4,
        Some(Interval::Bind),
        None,
        vec![super::pattern(PatternParams::new(0, 23, 0))],
        vec![],
        vec![],
    );

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
    let yene_anim = SerikoAnimation::new(
        9,
        Some(Interval::YenE),
        None,
        vec![super::pattern(PatternParams::new(0, 99, 0))],
        vec![],
        vec![],
    );
    scheduler.on_script_end(0, &[yene_anim]);
    let events = scheduler.step(0);
    assert!(events.iter().any(|e| e.animation_id == 9));

    // on_bind_changed: 有効化で即座に開始
    let bind_anim_dynamic = SerikoAnimation::new(
        5,
        Some(Interval::Bind),
        None,
        vec![super::pattern(PatternParams::new(0, 50, 0))],
        vec![],
        vec![],
    );
    scheduler.on_bind_changed(0, 5, true, std::slice::from_ref(&bind_anim_dynamic));
    assert!(scheduler.is_bind_active(0, 5));
    assert!(scheduler.is_animation_running(0, 5));

    // on_bind_changed: 無効化で即座に停止
    scheduler.on_bind_changed(0, 5, false, &[bind_anim_dynamic]);
    assert!(!scheduler.is_bind_active(0, 5));
    assert!(!scheduler.is_animation_running(0, 5));
}

#[test]
fn test_animation_scheduler_exclusive_and_background() {
    use crate::surfaces_core_integration::SerikoAnimation;

    let mut scheduler = AnimationScheduler::new();

    // 通常アニメーション 1
    let normal_anim = SerikoAnimation::new(
        1,
        Some(Interval::Always),
        None,
        vec![
            super::pattern(PatternParams::new(0, 101, 100)),
            super::pattern(PatternParams::new(1, -1, 0)),
        ],
        vec![],
        vec![],
    );

    // background アニメーション 2
    let bg_anim = SerikoAnimation::new(
        2,
        Some(Interval::Always),
        None,
        vec![
            super::pattern(PatternParams::new(0, 102, 100)),
            super::pattern(PatternParams::new(1, -1, 0)),
        ],
        vec![],
        vec![vec!["background".into()]],
    );

    // exclusive (全対象) アニメーション 3
    let exclusive_anim = SerikoAnimation::new(
        3,
        Some(Interval::RunOnce),
        None,
        vec![
            super::pattern(PatternParams::new(0, 103, 100)),
            super::pattern(PatternParams::new(1, -1, 0)),
        ],
        vec![],
        vec![vec!["exclusive".into()]],
    );

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
    use crate::surfaces_core_integration::SerikoAnimation;

    let mut scheduler = AnimationScheduler::new();

    let anim1 = SerikoAnimation::new(
        1,
        Some(Interval::Always),
        None,
        vec![super::pattern(PatternParams::new(0, 101, 100))],
        vec![],
        vec![],
    );
    let anim2 = SerikoAnimation::new(
        2,
        Some(Interval::Always),
        None,
        vec![super::pattern(PatternParams::new(0, 102, 100))],
        vec![],
        vec![],
    );

    // ID=1 のみを対象とする exclusive アニメーション
    let anim3 = SerikoAnimation::new(
        3,
        Some(Interval::RunOnce),
        None,
        vec![super::pattern(PatternParams::new(0, 103, 100))],
        vec![],
        vec![vec!["exclusive,(1)".into()]],
    );

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
    use crate::surfaces_core_integration::SerikoAnimation;

    let mut scheduler = AnimationScheduler::new();

    // サーフィス0側のアニメーション
    let anim_s0 = SerikoAnimation::new(
        10,
        Some(Interval::RunOnce),
        None,
        vec![
            super::pattern(PatternParams::new(0, 200, 50)),
            super::pattern(PatternParams::new(1, 201, 50)),
            super::pattern(PatternParams::new(2, 202, 50)),
        ],
        vec![],
        vec![vec!["shared-index".into()]],
    );

    // サーフィス1側のアニメーション
    let anim_s1 = SerikoAnimation::new(
        10,
        Some(Interval::RunOnce),
        None,
        vec![
            super::pattern(PatternParams::new(0, 300, 50)),
            super::pattern(PatternParams::new(1, 301, 50)),
            super::pattern(PatternParams::new(2, 302, 50)),
        ],
        vec![],
        vec![vec!["shared-index".into()]],
    );

    scheduler.start_animation(0, 0, &anim_s0);
    // 1フレーム進める (index 0 -> index 1)
    let events = scheduler.step(50);
    assert_eq!(events[0].pattern.surface(), 200);

    // サーフィス切替 (0 -> 1)
    scheduler.set_surface_with_shared_index(0, 1, &[anim_s1]);
    assert_eq!(scheduler.current_surface(0), 1);
    assert_eq!(scheduler.active_count(0), 1);

    // 次のフレーム進行で、新サーフィス1側の index 1 (surface 301) が再生されることを検証
    let events = scheduler.step(50);
    assert_eq!(events.len(), 1);
    assert_eq!(events[0].pattern.surface(), 301);
}
