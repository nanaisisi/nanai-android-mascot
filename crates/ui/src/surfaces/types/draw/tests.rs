use super::*;

#[test]
fn test_interval_parse_standard_variants() {
    assert_eq!(Interval::parse("always"), Interval::Always);
    assert_eq!(Interval::parse("sometimes"), Interval::Sometimes);
    assert_eq!(Interval::parse("rarely"), Interval::Rarely);
    assert_eq!(Interval::parse("never"), Interval::Never);
    assert_eq!(Interval::parse("runonce"), Interval::RunOnce);
    assert_eq!(Interval::parse("bind"), Interval::Bind);
    assert_eq!(Interval::parse("talk"), Interval::Talk);
    assert_eq!(Interval::parse("starttalk"), Interval::StartTalk);
    assert_eq!(Interval::parse("endtalk"), Interval::EndTalk);
    assert_eq!(Interval::parse(r"\e"), Interval::YenE);
    assert_eq!(Interval::parse("/e"), Interval::YenE);
}

#[test]
fn test_interval_parse_compound_variants() {
    assert_eq!(Interval::parse("bind+sometimes"), Interval::Sometimes);
    assert_eq!(Interval::parse("bind+rarely"), Interval::Rarely);
    assert_eq!(Interval::parse("bind+always"), Interval::Always);
    assert_eq!(Interval::parse("bind+random,4"), Interval::Random(4));
    assert_eq!(
        Interval::parse("bind+periodic,500"),
        Interval::Periodic(500)
    );
    assert_eq!(Interval::parse("bind+talk"), Interval::Bind);
}

#[test]
fn test_interval_parse_parametric_random_and_periodic() {
    assert_eq!(Interval::parse("random,3"), Interval::Random(3));
    assert_eq!(Interval::parse("random,0"), Interval::Random(0));
    assert_eq!(Interval::parse("periodic,1000"), Interval::Periodic(1000));
    assert_eq!(Interval::parse("periodic,0"), Interval::Periodic(0));

    // Spacing around comma and values
    assert_eq!(Interval::parse("  random , 25  "), Interval::Random(25));
    assert_eq!(Interval::parse("periodic , 500 "), Interval::Periodic(500));

    // Fallbacks for missing or invalid numeric parameters
    assert_eq!(Interval::parse("random"), Interval::Random(10));
    assert_eq!(Interval::parse("random,"), Interval::Random(10));
    assert_eq!(Interval::parse("random,not_a_number"), Interval::Random(10));
    assert_eq!(Interval::parse("random,-5"), Interval::Random(10));
    assert_eq!(Interval::parse("random,3.14"), Interval::Random(10));

    assert_eq!(Interval::parse("periodic"), Interval::Periodic(1000));
    assert_eq!(Interval::parse("periodic,"), Interval::Periodic(1000));
    assert_eq!(
        Interval::parse("periodic,invalid"),
        Interval::Periodic(1000)
    );
    assert_eq!(Interval::parse("periodic,-100"), Interval::Periodic(1000));
    assert_eq!(Interval::parse("periodic,100.5"), Interval::Periodic(1000));
}

#[test]
fn test_interval_parse_edge_cases_and_casing() {
    // Case-insensitivity
    assert_eq!(Interval::parse("ALWAYS"), Interval::Always);
    assert_eq!(Interval::parse("SomeTimes"), Interval::Sometimes);
    assert_eq!(Interval::parse("RaReLy"), Interval::Rarely);
    assert_eq!(Interval::parse("RunOnce"), Interval::RunOnce);
    assert_eq!(Interval::parse("NEVER"), Interval::Never);
    assert_eq!(Interval::parse("BIND"), Interval::Bind);
    assert_eq!(Interval::parse("TALK"), Interval::Talk);
    assert_eq!(Interval::parse("StartTalk"), Interval::StartTalk);
    assert_eq!(Interval::parse("EndTalk"), Interval::EndTalk);
    assert_eq!(Interval::parse(r"\E"), Interval::YenE);
    assert_eq!(Interval::parse("/E"), Interval::YenE);
    assert_eq!(Interval::parse("RANDOM,7"), Interval::Random(7));
    assert_eq!(Interval::parse("PERIODIC,250"), Interval::Periodic(250));

    // Non-parametric keywords with trailing comma/param are still matched by head
    assert_eq!(Interval::parse("always,ignored"), Interval::Always);
    assert_eq!(Interval::parse("runonce,123"), Interval::RunOnce);
    assert_eq!(Interval::parse(r"\e,extra"), Interval::YenE);

    // Empty and whitespace-only
    assert_eq!(Interval::parse(""), Interval::Custom("".to_string()));
    assert_eq!(Interval::parse("   "), Interval::Custom("".to_string()));

    // Unknown or custom strings
    assert_eq!(
        Interval::parse("custom_action"),
        Interval::Custom("custom_action".to_string())
    );
    assert_eq!(
        Interval::parse("custom_action,param"),
        Interval::Custom("custom_action".to_string())
    );
}

#[test]
fn test_interval_serde_roundtrip() {
    let cases = vec![
        Interval::Always,
        Interval::Sometimes,
        Interval::Rarely,
        Interval::Random(42),
        Interval::Periodic(2500),
        Interval::RunOnce,
        Interval::Never,
        Interval::Bind,
        Interval::Talk,
        Interval::StartTalk,
        Interval::EndTalk,
        Interval::YenE,
        Interval::Custom("my_interval".to_string()),
    ];

    for interval in cases {
        let json = serde_json::to_string(&interval).expect("serialization should succeed");
        let deserialized: Interval =
            serde_json::from_str(&json).expect("deserialization should succeed");
        assert_eq!(interval, deserialized);
    }
}

#[test]
fn test_draw_method_parse_and_serde() {
    assert_eq!(DrawMethod::parse("base"), DrawMethod::Base);
    assert_eq!(DrawMethod::parse("OVERLAY"), DrawMethod::Overlay);
    assert_eq!(DrawMethod::parse("fast"), DrawMethod::OverlayFast);
    assert_eq!(DrawMethod::parse("overlayfast"), DrawMethod::OverlayFast);
    assert_eq!(DrawMethod::parse("overlay-fast"), DrawMethod::OverlayFast);
    assert_eq!(DrawMethod::parse("interpolate"), DrawMethod::Interpolate);
    assert_eq!(DrawMethod::parse("replace"), DrawMethod::Replace);
    assert_eq!(DrawMethod::parse("add"), DrawMethod::Add);
    assert_eq!(DrawMethod::parse("bind"), DrawMethod::Bind);
    assert_eq!(DrawMethod::parse("asis"), DrawMethod::AsIs);
    assert_eq!(DrawMethod::parse("auto"), DrawMethod::Auto);
    assert_eq!(DrawMethod::parse("move"), DrawMethod::Move);
    assert_eq!(DrawMethod::parse("scaling"), DrawMethod::Scaling);
    assert_eq!(DrawMethod::parse("insert"), DrawMethod::Insert);
    assert_eq!(DrawMethod::parse("reduce"), DrawMethod::Reduce);
    assert_eq!(
        DrawMethod::parse("overlaymultiply"),
        DrawMethod::Blend("multiply-fast".to_string())
    );
    assert_eq!(
        DrawMethod::parse("overlayscreen"),
        DrawMethod::Blend("screen-fast".to_string())
    );
    assert_eq!(
        DrawMethod::parse("blend-multiply"),
        DrawMethod::Blend("multiply".to_string())
    );
    assert_eq!(DrawMethod::parse("start,1"), DrawMethod::Start(Some(1)));
    assert_eq!(DrawMethod::parse("stop,2"), DrawMethod::Stop(Some(2)));
    assert_eq!(
        DrawMethod::parse("alternativestart,(1,2)"),
        DrawMethod::AlternativeStart(vec![1, 2])
    );
    assert_eq!(
        DrawMethod::parse("alternativestop,[1.2]"),
        DrawMethod::AlternativeStop(vec![1, 2])
    );
    assert_eq!(
        DrawMethod::parse("parallelstart,(3,4)"),
        DrawMethod::ParallelStart(vec![3, 4])
    );
    assert_eq!(
        DrawMethod::parse("parallelstop,[3.4]"),
        DrawMethod::ParallelStop(vec![3, 4])
    );
    assert_eq!(
        DrawMethod::parse("custom_val"),
        DrawMethod::Custom("custom_val".to_string())
    );

    let cases = vec![
        DrawMethod::Base,
        DrawMethod::Overlay,
        DrawMethod::OverlayFast,
        DrawMethod::Interpolate,
        DrawMethod::Replace,
        DrawMethod::Add,
        DrawMethod::Bind,
        DrawMethod::AsIs,
        DrawMethod::Auto,
        DrawMethod::Move,
        DrawMethod::Insert,
        DrawMethod::Start(Some(1)),
        DrawMethod::Stop(Some(2)),
        DrawMethod::AlternativeStart(vec![1, 2]),
        DrawMethod::AlternativeStop(vec![1, 2]),
        DrawMethod::ParallelStart(vec![3, 4]),
        DrawMethod::ParallelStop(vec![3, 4]),
        DrawMethod::Reduce,
        DrawMethod::Blend("screen".to_string()),
        DrawMethod::Custom("custom_mode".to_string()),
    ];

    for dm in cases {
        let json = serde_json::to_string(&dm).expect("serialization should succeed");
        let deserialized: DrawMethod =
            serde_json::from_str(&json).expect("deserialization should succeed");
        assert_eq!(dm, deserialized);
    }
}
