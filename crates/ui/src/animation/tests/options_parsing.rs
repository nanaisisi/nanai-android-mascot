/**
 * @file options_parsing.rs
 * @brief SERIKO アニメーションオプション構文パース単体テスト
 */

use crate::animation::scheduler::ParsedAnimationOptions;

#[test]
fn test_parsed_animation_options_coverage() {
    let opts = ParsedAnimationOptions::from_raw_options(&[
        vec![
            "".to_string(),
            "exclusive+(1,2)".to_string(),
            "background".to_string(),
            "shared-index".to_string(),
        ],
        vec![
            "exclusive".to_string(),
            "(5,6)".to_string(),
            "shared_index".to_string(),
        ],
        vec![
            "exclusive()".to_string(),
            "()".to_string(),
            "exclusive+(abc)".to_string(),
            "(xyz)".to_string(),
        ],
    ]);
    assert!(opts.is_exclusive);
    assert!(opts.is_background);
    assert!(opts.is_shared_index);
    assert!(opts.exclusive_targets.is_some());
}
