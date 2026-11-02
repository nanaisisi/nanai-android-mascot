use super::*;
use crate::surfaces::{AnimationPattern, DrawMethod, Interval, SurfacesTxt};

fn pattern(index: u32, surface: i32, wait: u32) -> AnimationPattern {
    AnimationPattern {
        index,
        method: DrawMethod::Overlay,
        surface,
        wait,
        wait_max: None,
        x: 0,
        y: 0,
        options: vec![],
    }
}

#[test]
fn test_build_timeline() {
    let patterns = vec![pattern(0, 6, 0), pattern(1, -1, 85)];
    let timeline = build_timeline(&patterns);
    assert_eq!(timeline[0].at_ms, 0);
    assert_eq!(timeline[1].at_ms, 85);

    assert_eq!(cycle_len_ms(&patterns), 170);

    let shuffled = vec![pattern(1, -1, 85), pattern(0, 6, 0)];
    let timeline = build_timeline(&shuffled);
    assert_eq!(timeline[0].pattern.surface, 6);
    assert_eq!(timeline[1].at_ms, 85);
}

#[test]
fn test_frame_at() {
    let patterns = vec![pattern(0, 6, 0), pattern(1, -1, 85)];
    let tl = Timeline::new(&patterns);
    assert_eq!(tl.frame_at(0).unwrap().pattern.surface, 6);
    assert_eq!(tl.frame_at(84).unwrap().pattern.surface, 6);
    assert_eq!(tl.frame_at(85).unwrap().pattern.surface, -1);
    assert_eq!(tl.frame_at(10_000).unwrap().pattern.surface, -1);
    assert_eq!(tl.total_ms(), 170);

    assert!(Timeline::new(&[]).frame_at(500).is_none());
    assert_eq!(Timeline::new(&[]).total_ms(), 0);
    assert_eq!(cycle_len_ms(&[]), 0);
}

#[test]
fn test_multi_frame_timeline() {
    let patterns = vec![pattern(0, 9, 150), pattern(1, 10, 150), pattern(2, -1, 0)];
    let timeline = build_timeline(&patterns);
    assert_eq!(
        [timeline[0].at_ms, timeline[1].at_ms, timeline[2].at_ms],
        [150, 300, 300]
    );
    assert_eq!(cycle_len_ms(&patterns), 300);
}

#[test]
fn test_interval_firing() {
    assert_eq!(Interval::parse("random,5").fire_per_second(), Some(0.2));
    assert!((Interval::parse("sometimes").fire_per_second().unwrap() - 0.1).abs() < 1e-9);
    assert!((Interval::parse("rarely").fire_per_second().unwrap() - 1f64 / 30f64).abs() < 1e-9);

    assert_eq!(Interval::parse("periodic,1000").periodic_ms(), Some(1000));
    assert!(Interval::parse("periodic,1000").should_fire(1_000, 0.99));
    assert!(Interval::parse("periodic,1000").should_fire(10_000, 0.99));
    assert!(!Interval::parse("periodic,1000").should_fire(500, 0.99));

    for v in ["never", "bind", "talk", "starttalk", "endtalk", r"\e"] {
        assert!(!Interval::parse(v).should_fire(100_000, 0.0), "{v}");
    }

    assert!(Interval::parse("runonce").should_fire(0, 0.0));
    assert!(Interval::parse("always").should_fire(0, 0.0));

    let random5 = Interval::parse("random,5");
    assert!(random5.should_fire(5_000, 0.5), "5秒経過で確率は1.0");
    assert!(!random5.should_fire(1_000, 0.9), "1秒経過で確率は0.2");
    assert!(random5.should_fire(1_000, 0.1), "1秒経過・乱数0.1は発火");
}

#[test]
fn test_mock_nanai_animation() {
    let path = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("../../assets/ghost/mock_nanai/shell/master/surfaces.txt");
    if !path.exists() {
        return;
    }
    let content = crate::vfs::open_text_file(&path).unwrap();
    let txt = SurfacesTxt::parse(&content);
    let def0 = txt.surface(0).unwrap();
    let anim0 = &def0.animations[&0];
    assert_eq!(anim0.interval, Some(Interval::Random(3)));
    let timeline = build_timeline(&anim0.patterns);
    assert_eq!(timeline[0].pattern.surface, 6);
    assert_eq!(timeline[0].at_ms, 0);
    assert_eq!(timeline[1].pattern.surface, -1);
    assert_eq!(timeline[1].at_ms, 85);
}

#[test]
fn test_animation_extra_coverage() {
    assert_eq!(Interval::parse("random,0").fire_per_second(), Some(1.0));
    let patterns = vec![pattern(0, 6, 100)];
    let tl = Timeline::new(&patterns);
    assert_eq!(tl.frames().len(), 1);
    assert_eq!(tl.total_ms(), 200);
}

#[test]
fn test_animation_100_percent_coverage() {
    assert_eq!(Interval::parse("random,abc"), Interval::Random(10));
    assert_eq!(Interval::parse("periodic,abc"), Interval::Periodic(1000));
    let custom = Interval::parse("unknown_type");
    assert!(!custom.is_event_driven());
    assert_eq!(custom.fire_per_second(), None);
    assert_eq!(custom.periodic_ms(), None);
    assert!(custom.should_fire(0, 0.0));

    let zero_period = Interval::Periodic(0);
    assert!(!zero_period.should_fire(1000, 0.0));
}

#[test]
fn test_animation_100_percent_branches() {
    assert_eq!(Interval::Always.fire_per_second(), None);
    assert_eq!(Interval::Sometimes.fire_per_second(), Some(1.0 / 10.0));
    assert_eq!(Interval::Rarely.fire_per_second(), Some(1.0 / 30.0));

    let periodic = Interval::Periodic(1000);
    assert!(!periodic.should_fire(500, 0.0));

    let random = Interval::Random(5);
    assert!(!random.should_fire(100, 0.99));
}

#[test]
fn test_animation_100_percent_perfect_coverage() {
    for inv in [
        Interval::Always,
        Interval::Sometimes,
        Interval::Rarely,
        Interval::Random(3),
        Interval::Periodic(500),
        Interval::RunOnce,
        Interval::Never,
        Interval::Bind,
        Interval::Talk,
        Interval::StartTalk,
        Interval::EndTalk,
        Interval::YenE,
        Interval::Custom("test".to_string()),
    ] {
        let _ = inv.fire_per_second();
        let _ = inv.periodic_ms();
        let _ = inv.is_event_driven();
        let _ = inv.should_fire(100, 0.5);
    }
}

#[test]
fn test_animation_scheduler_basic() {
    use crate::surfaces::SerikoAnimation;

    let mut scheduler = AnimationScheduler::new();
    scheduler.set_surface(0, 0);
    assert_eq!(scheduler.current_surface(0), 0);
    assert_eq!(scheduler.current_surface(1), 10);

    let anim = SerikoAnimation {
        id: 1,
        interval: Some(Interval::RunOnce),
        name: None,
        patterns: vec![pattern(0, 101, 50), pattern(1, 102, 50), pattern(2, -1, 0)],
        collisions: vec![],
        options: vec![],
    };

    scheduler.schedule_surface_animations(0, 0, &[anim.clone()], 0.0);
    assert_eq!(scheduler.active_count(0), 1);

    // 0ms時点
    let events = scheduler.step(0);
    assert!(events.is_empty());

    // 50ms経過で1フレーム目
    let events = scheduler.step(50);
    assert_eq!(events.len(), 1);
    assert_eq!(events[0].pattern.surface, 101);
    assert!(!events[0].is_finished);

    // さらに50ms経過で2フレーム目
    let events = scheduler.step(50);
    assert_eq!(events.len(), 1);
    assert_eq!(events[0].pattern.surface, 102);
    assert!(!events[0].is_finished);

    // さらに0msで3フレーム目（surface -1 到達で終了）
    let events = scheduler.step(0);
    assert_eq!(events.len(), 1);
    assert_eq!(events[0].pattern.surface, -1);
    assert!(events[0].is_finished);
    assert_eq!(scheduler.active_count(0), 0);
}

#[test]
fn test_animation_scheduler_pause_resume() {
    use crate::surfaces::SerikoAnimation;

    let mut scheduler = AnimationScheduler::new();
    let anim = SerikoAnimation {
        id: 5,
        interval: Some(Interval::Always),
        name: None,
        patterns: vec![pattern(0, 10, 100)],
        collisions: vec![],
        options: vec![],
    };

    scheduler.start_animation(0, 0, &anim);
    assert_eq!(scheduler.active_count(0), 1);

    scheduler.pause_animation(0, 5);
    assert!(scheduler.is_animation_paused(0, 5));

    let events = scheduler.step(200);
    assert!(events.is_empty());

    scheduler.resume_animation(0, 5);
    assert!(!scheduler.is_animation_paused(0, 5));

    let events = scheduler.step(100);
    assert_eq!(events.len(), 1);
    assert_eq!(events[0].pattern.surface, 10);
}

#[test]
fn test_animation_scheduler_talk_and_bind() {
    use crate::surfaces::SerikoAnimation;

    let mut scheduler = AnimationScheduler::new();
    let talk_anim = SerikoAnimation {
        id: 1,
        interval: Some(Interval::Custom("talk,2".into())),
        name: None,
        patterns: vec![pattern(0, 20, 0)],
        collisions: vec![],
        options: vec![],
    };
    let start_anim = SerikoAnimation {
        id: 2,
        interval: Some(Interval::StartTalk),
        name: None,
        patterns: vec![pattern(0, 21, 0)],
        collisions: vec![],
        options: vec![],
    };
    let end_anim = SerikoAnimation {
        id: 3,
        interval: Some(Interval::EndTalk),
        name: None,
        patterns: vec![pattern(0, 22, 0)],
        collisions: vec![],
        options: vec![],
    };
    let bind_anim = SerikoAnimation {
        id: 4,
        interval: Some(Interval::Bind),
        name: None,
        patterns: vec![pattern(0, 23, 0)],
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
        patterns: vec![pattern(0, 99, 0)],
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
        patterns: vec![pattern(0, 101, 100), pattern(1, -1, 0)],
        collisions: vec![],
        options: vec![],
    };

    // background アニメーション 2
    let bg_anim = SerikoAnimation {
        id: 2,
        interval: Some(Interval::Always),
        name: None,
        patterns: vec![pattern(0, 102, 100), pattern(1, -1, 0)],
        collisions: vec![],
        options: vec![vec!["background".into()]],
    };

    // exclusive (全対象) アニメーション 3
    let exclusive_anim = SerikoAnimation {
        id: 3,
        interval: Some(Interval::RunOnce),
        name: None,
        patterns: vec![pattern(0, 103, 100), pattern(1, -1, 0)],
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
        patterns: vec![pattern(0, 101, 100)],
        collisions: vec![],
        options: vec![],
    };
    let anim2 = SerikoAnimation {
        id: 2,
        interval: Some(Interval::Always),
        name: None,
        patterns: vec![pattern(0, 102, 100)],
        collisions: vec![],
        options: vec![],
    };

    // ID=1 のみを対象とする exclusive アニメーション
    let anim3 = SerikoAnimation {
        id: 3,
        interval: Some(Interval::RunOnce),
        name: None,
        patterns: vec![pattern(0, 103, 100)],
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
            pattern(0, 200, 50),
            pattern(1, 201, 50),
            pattern(2, 202, 50),
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
            pattern(0, 300, 50),
            pattern(1, 301, 50),
            pattern(2, 302, 50),
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

#[test]
fn test_animation_scheduler_stop_and_offset() {
    use crate::surfaces::SerikoAnimation;

    let mut scheduler = AnimationScheduler::new();

    let anim1 = SerikoAnimation {
        id: 10,
        interval: Some(Interval::Always),
        name: Some("test_anim".to_string()),
        patterns: vec![pattern(0, 100, 50), pattern(1, 101, 50)],
        collisions: vec![],
        options: vec![],
    };
    let anim2 = SerikoAnimation {
        id: 20,
        interval: Some(Interval::Always),
        name: None,
        patterns: vec![pattern(0, 200, 50), pattern(1, 201, 50)],
        collisions: vec![],
        options: vec![],
    };

    // 動的オフセットを設定
    scheduler.set_animation_offset(0, 10, 40, -25);
    assert_eq!(scheduler.get_animation_offset(0, 10), (40, -25));
    assert_eq!(scheduler.get_animation_offset(0, 20), (0, 0));

    scheduler.start_animation(0, 0, &anim1);
    scheduler.start_animation(0, 0, &anim2);
    assert_eq!(scheduler.active_count(0), 2);

    let events = scheduler.step(50);
    assert_eq!(events.len(), 2);
    let ev1 = events.iter().find(|e| e.animation_id == 10).unwrap();
    let ev2 = events.iter().find(|e| e.animation_id == 20).unwrap();
    assert_eq!(ev1.offset_x, 40);
    assert_eq!(ev1.offset_y, -25);
    assert_eq!(ev2.offset_x, 0);
    assert_eq!(ev2.offset_y, 0);

    // stop_animation で ID=10 のみ停止
    scheduler.stop_animation(0, 10);
    assert_eq!(scheduler.active_count(0), 1);

    // 次フレームで ID=20 のみステップされる
    let events2 = scheduler.step(50);
    assert_eq!(events2.len(), 1);
    assert_eq!(events2[0].animation_id, 20);

    // サーフィス切り替えでオフセットがクリアされることを確認
    scheduler.set_surface(0, 1);
    assert_eq!(scheduler.get_animation_offset(0, 10), (0, 0));
}

#[test]
fn test_animation_scheduler_pattern_control_methods() {
    use crate::surfaces::SerikoAnimation;

    let mut scheduler = AnimationScheduler::new();

    let target_anim = SerikoAnimation {
        id: 10,
        interval: Some(Interval::Never),
        name: None,
        patterns: vec![
            pattern(0, 501, 100),
            pattern(1, 502, 100),
            pattern(2, -1, 100),
        ],
        collisions: vec![],
        options: vec![],
    };

    let controller_anim = SerikoAnimation {
        id: 1,
        interval: Some(Interval::RunOnce),
        name: None,
        patterns: vec![
            AnimationPattern {
                index: 0,
                method: DrawMethod::Start(Some(10)),
                surface: 10,
                wait: 10,
                wait_max: None,
                x: 0,
                y: 0,
                options: vec![],
            },
            AnimationPattern {
                index: 1,
                method: DrawMethod::Stop(Some(10)),
                surface: 10,
                wait: 50,
                wait_max: None,
                x: 0,
                y: 0,
                options: vec![],
            },
            AnimationPattern {
                index: 2,
                method: DrawMethod::Overlay,
                surface: -1,
                wait: 100,
                wait_max: None,
                x: 0,
                y: 0,
                options: vec![],
            },
        ],
        collisions: vec![],
        options: vec![],
    };

    let catalog = vec![target_anim, controller_anim.clone()];

    // controller_anim を開始
    scheduler.start_animation(0, 0, &controller_anim);
    assert_eq!(scheduler.active_count(0), 1);

    // pattern 0 (Start(10)) が進むと target_anim (ID=10) が自動的に catalog から開始される
    let events = scheduler.step_with_catalog(10, &catalog);
    assert!(!events.is_empty());
    assert_eq!(scheduler.active_count(0), 2); // controller + target

    // pattern 1 (Stop(10)) に到達すると target_anim (ID=10) が停止される
    let events2 = scheduler.step_with_catalog(50, &catalog);
    assert!(!events2.is_empty());
    assert_eq!(scheduler.active_count(0), 1); // target は停止
}
