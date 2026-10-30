use crate::surfaces::*;

#[test]
fn test_expand_range() {
    assert_eq!(
        expand_range("0-9,20-22"),
        (0..10).chain(20..23).collect::<Vec<u32>>()
    );
    assert_eq!(expand_range("19,100,101"), [19, 100, 101]);
    assert_eq!(expand_range("[7]"), [7]);
    assert!(expand_range("abc").is_empty());
}

#[test]
fn test_parse_interval_all_variants() {
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
    assert_eq!(Interval::parse("random,3"), Interval::Random(3));
    assert_eq!(Interval::parse("periodic,1000"), Interval::Periodic(1000));
    assert_eq!(
        Interval::parse("unknown_mode"),
        Interval::Custom("unknown_mode".to_string())
    );
    assert_eq!(
        Interval::parse("custom_item,123"),
        Interval::Custom("custom_item".to_string())
    );
}

#[test]
fn test_parse_draw_method_variants() {
    assert_eq!(DrawMethod::parse("base"), DrawMethod::Base);
    assert_eq!(DrawMethod::parse("overlay"), DrawMethod::Overlay);
    assert_eq!(DrawMethod::parse("overlayfast"), DrawMethod::OverlayFast);
    assert_eq!(DrawMethod::parse("fast"), DrawMethod::OverlayFast);
    assert_eq!(DrawMethod::parse("overlay-fast"), DrawMethod::OverlayFast);
    assert_eq!(DrawMethod::parse("interpolate"), DrawMethod::Interpolate);
    assert_eq!(DrawMethod::parse("replace"), DrawMethod::Replace);
    assert_eq!(DrawMethod::parse("add"), DrawMethod::Add);
    assert_eq!(DrawMethod::parse("bind"), DrawMethod::Bind);
    assert_eq!(
        DrawMethod::parse("blend-multiply"),
        DrawMethod::Blend("multiply".to_string())
    );
    assert_eq!(
        DrawMethod::parse("blend-add"),
        DrawMethod::Blend("add".to_string())
    );
    assert_eq!(
        DrawMethod::parse("blend-sub"),
        DrawMethod::Blend("sub".to_string())
    );
    assert_eq!(
        DrawMethod::parse("start"),
        DrawMethod::Custom("start".to_string())
    );
    assert_eq!(
        DrawMethod::parse("stop"),
        DrawMethod::Custom("stop".to_string())
    );
    assert_eq!(
        DrawMethod::parse("move"),
        DrawMethod::Custom("move".to_string())
    );
    assert_eq!(
        DrawMethod::parse("insert"),
        DrawMethod::Custom("insert".to_string())
    );
    assert_eq!(
        DrawMethod::parse("custom_method"),
        DrawMethod::Custom("custom_method".to_string())
    );
}

#[test]
fn test_parse_draw_method_formatting() {
    assert_eq!(DrawMethod::parse("BASE"), DrawMethod::Base);
    assert_eq!(DrawMethod::parse("OverLay"), DrawMethod::Overlay);
    assert_eq!(DrawMethod::parse("OverlayFast"), DrawMethod::OverlayFast);
    assert_eq!(DrawMethod::parse("FAST"), DrawMethod::OverlayFast);
    assert_eq!(DrawMethod::parse("OVERLAY-FAST"), DrawMethod::OverlayFast);
    assert_eq!(DrawMethod::parse("INTERPOLATE"), DrawMethod::Interpolate);
    assert_eq!(DrawMethod::parse("REPLACE"), DrawMethod::Replace);
    assert_eq!(DrawMethod::parse("ADD"), DrawMethod::Add);
    assert_eq!(DrawMethod::parse("BIND"), DrawMethod::Bind);
    assert_eq!(
        DrawMethod::parse("BLEND-MULTIPLY"),
        DrawMethod::Blend("multiply".to_string())
    );

    assert_eq!(DrawMethod::parse("  base  "), DrawMethod::Base);
    assert_eq!(
        DrawMethod::parse(" blend-screen "),
        DrawMethod::Blend("screen".to_string())
    );
    assert_eq!(
        DrawMethod::parse("  move_to  "),
        DrawMethod::Custom("move_to".to_string())
    );
}

#[test]
fn test_parse_interval_formatting_and_defaults() {
    assert_eq!(Interval::parse("ALWAYS"), Interval::Always);
    assert_eq!(Interval::parse("SomeTimes"), Interval::Sometimes);
    assert_eq!(Interval::parse("RaReLy"), Interval::Rarely);
    assert_eq!(Interval::parse("NeVeR"), Interval::Never);
    assert_eq!(Interval::parse("RunOnce"), Interval::RunOnce);
    assert_eq!(Interval::parse("BIND"), Interval::Bind);
    assert_eq!(Interval::parse("TALK"), Interval::Talk);
    assert_eq!(Interval::parse("STARTTALK"), Interval::StartTalk);
    assert_eq!(Interval::parse("ENDTALK"), Interval::EndTalk);
    assert_eq!(Interval::parse(r"\E"), Interval::YenE);
    assert_eq!(Interval::parse("/E"), Interval::YenE);
    assert_eq!(Interval::parse("RANDOM,15"), Interval::Random(15));
    assert_eq!(Interval::parse("PERIODIC,500"), Interval::Periodic(500));

    assert_eq!(Interval::parse("  always  "), Interval::Always);
    assert_eq!(Interval::parse(" random , 7 "), Interval::Random(7));
    assert_eq!(
        Interval::parse(" periodic , 2500 "),
        Interval::Periodic(2500)
    );

    assert_eq!(Interval::parse("random"), Interval::Random(10));
    assert_eq!(Interval::parse("random,invalid"), Interval::Random(10));
    assert_eq!(Interval::parse("random,-5"), Interval::Random(10));
    assert_eq!(Interval::parse("periodic"), Interval::Periodic(1000));
    assert_eq!(Interval::parse("periodic,abc"), Interval::Periodic(1000));
}
