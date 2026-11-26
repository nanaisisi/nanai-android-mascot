use super::*;

#[test]
fn test_compute_balloon_text_layout_basic() {
    let text = "こんにちは\n世界";
    let res = compute_balloon_text_layout(Compute_balloon_text_layoutParams {
        text,
        max_container_width: 200.0,
        font_size_px: 16.0,
        line_height_px: 20.0,
        padding_x: 10.0,
    });

    assert_eq!(res.line_count(), 2);
    assert_eq!(res.lines()[0].text(), "こんにちは");
    assert_eq!(res.lines()[1].text(), "世界");
    assert_eq!(res.total_height_px(), 40.0);
}

#[test]
fn test_compute_balloon_text_layout_word_wrap() {
    let text = "あいうえおかきくけこさしすせそ";
    // 180px - padding 20px = 160px. font 16px -> 1行10文字 -> 計2行に折れる
    let res = compute_balloon_text_layout(Compute_balloon_text_layoutParams {
        text,
        max_container_width: 180.0,
        font_size_px: 16.0,
        line_height_px: 20.0,
        padding_x: 10.0,
    });

    assert_eq!(res.line_count(), 2);
    assert_eq!(res.lines()[0].text(), "あいうえおかきくけこ");
    assert_eq!(res.lines()[1].text(), "さしすせそ");
}
