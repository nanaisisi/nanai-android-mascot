/**
 * @file talk_events.rs
 * @brief SERIKO 発話イベント（on_talk_start, on_char_spoken, on_talk_end, on_script_end）トリガー単体テスト
 */
use super::*;

#[test]
fn test_talk_event_triggers() {
    let mut scheduler = AnimationScheduler::new();

    let anims = vec![SerikoAnimation::new(
        1,
        Some(Interval::Talk),
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
    )];

    // 発話未開始状態での on_talk_end 呼び出し (安全判定)
    scheduler.on_talk_end(0, &anims);

    let talk_anims = vec![
        SerikoAnimation::new(
            100,
            Some(Interval::StartTalk),
            None,
            vec![AnimationPattern::new(
                0,
                DrawMethod::Overlay,
                10,
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
            101,
            Some(Interval::Talk),
            None,
            vec![AnimationPattern::new(
                0,
                DrawMethod::Overlay,
                11,
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
            102,
            Some(Interval::Custom("talk,2".to_string())),
            None,
            vec![AnimationPattern::new(
                0,
                DrawMethod::Overlay,
                12,
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
            103,
            Some(Interval::EndTalk),
            None,
            vec![AnimationPattern::new(
                0,
                DrawMethod::Overlay,
                13,
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
            104,
            Some(Interval::YenE),
            None,
            vec![AnimationPattern::new(
                0,
                DrawMethod::Overlay,
                14,
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

    scheduler.on_talk_start(0, &talk_anims);
    scheduler.on_char_spoken(0, &talk_anims);
    scheduler.on_char_spoken(0, &talk_anims);
    scheduler.on_talk_end(0, &talk_anims);
    scheduler.on_script_end(0, &talk_anims);
}
