use super::super::*;

#[test]
fn test_expand_range() {
    assert_eq!(expand_range("0-2, ,5"), vec![0, 1, 2, 5]);
    assert_eq!(expand_range("[10-12]"), vec![10, 11, 12]);
    assert_eq!(expand_range("invalid"), Vec::<u32>::new());
}

#[test]
fn test_split_id_suffix() {
    assert_eq!(utils::split_id_suffix("test100"), ("test", Some(100)));
    assert_eq!(utils::split_id_suffix("noint"), ("noint", None));
}

#[test]
fn test_first_i32() {
    assert_eq!(first_i32(" 42 , 100 "), Some(42));
    assert_eq!(first_i32("abc"), None);
}

#[test]
fn test_parse_balloon_offset_key() {
    assert_eq!(
        parse_balloon_offset_key("balloon.offset.x"),
        Some(("*".to_string(), 'x'))
    );
    assert_eq!(
        parse_balloon_offset_key("sakura.balloon.offset.y"),
        Some(("sakura".to_string(), 'y'))
    );
    assert_eq!(parse_balloon_offset_key("balloon.offset"), None);
    assert_eq!(parse_balloon_offset_key("sakura.balloon.offset"), None);
    assert_eq!(parse_balloon_offset_key(".balloon.offset.x"), None);
    assert_eq!(parse_balloon_offset_key("invalid"), None);
}
