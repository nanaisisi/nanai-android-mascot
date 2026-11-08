/**
 * @file talk_events.rs
 * @brief SERIKO 発話イベント（on_talk_start, on_char_spoken, on_talk_end, on_script_end）トリガー単体テスト
 */
use super::*;

#[test]
fn test_talk_event_triggers() {
    let mut scheduler = AnimationScheduler::new();

    let anims = vec![SerikoAnimation {
        id: 1,
        name: None,
        interval: Some(Interval::Talk),
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
    }];

    // 発話未開始状態での on_talk_end 呼び出し (安全判定)
    scheduler.on_talk_end(0, &anims);

    let talk_anims = vec![
        SerikoAnimation {
            id: 100,
            name: None,
            interval: Some(Interval::StartTalk),
            options: vec![],
            collisions: vec![],
            patterns: vec![AnimationPattern {
                index: 0,
                method: DrawMethod::Overlay,
                surface: 10,
                wait: 10,
                wait_max: None,
                x: 0,
                y: 0,
                options: vec![],
            }],
        },
        SerikoAnimation {
            id: 101,
            name: None,
            interval: Some(Interval::Talk),
            options: vec![],
            collisions: vec![],
            patterns: vec![AnimationPattern {
                index: 0,
                method: DrawMethod::Overlay,
                surface: 11,
                wait: 10,
                wait_max: None,
                x: 0,
                y: 0,
                options: vec![],
            }],
        },
        SerikoAnimation {
            id: 102,
            name: None,
            interval: Some(Interval::Custom("talk,2".to_string())),
            options: vec![],
            collisions: vec![],
            patterns: vec![AnimationPattern {
                index: 0,
                method: DrawMethod::Overlay,
                surface: 12,
                wait: 10,
                wait_max: None,
                x: 0,
                y: 0,
                options: vec![],
            }],
        },
        SerikoAnimation {
            id: 103,
            name: None,
            interval: Some(Interval::EndTalk),
            options: vec![],
            collisions: vec![],
            patterns: vec![AnimationPattern {
                index: 0,
                method: DrawMethod::Overlay,
                surface: 13,
                wait: 10,
                wait_max: None,
                x: 0,
                y: 0,
                options: vec![],
            }],
        },
        SerikoAnimation {
            id: 104,
            name: None,
            interval: Some(Interval::YenE),
            options: vec![],
            collisions: vec![],
            patterns: vec![AnimationPattern {
                index: 0,
                method: DrawMethod::Overlay,
                surface: 14,
                wait: 10,
                wait_max: None,
                x: 0,
                y: 0,
                options: vec![],
            }],
        },
    ];

    scheduler.on_talk_start(0, &talk_anims);
    scheduler.on_char_spoken(0, &talk_anims);
    scheduler.on_char_spoken(0, &talk_anims);
    scheduler.on_talk_end(0, &talk_anims);
    scheduler.on_script_end(0, &talk_anims);
}
