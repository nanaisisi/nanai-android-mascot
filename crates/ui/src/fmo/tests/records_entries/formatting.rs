/**
 * @file formatting.rs
 * @brief format_fmo_text (ローカル・リモートサニタイズ) 単体テスト
 */
use super::*;

#[test]
fn test_format_fmo_text_local_and_remote() {
    let mut rec = FmoRecord::new("001", "Nanai");
    rec.path = "/opt/nanai".to_string();
    rec.ghostpath = "/opt/nanai/ghost/master".to_string();
    rec.hwnd = 12345;
    rec.kerohwnd = Some(67890);
    rec.hwndlist = vec![12345, 67890];
    rec.fullname = Some("Nanai The Mascot".to_string());
    rec.modulestate = Some("shiori:running".to_string());

    // ローカル出力
    let text_local = format_fmo_text(&[rec.clone()], false);
    assert!(text_local.contains("ssp_fmo_header_001.path\x01/opt/nanai\r\n"));
    assert!(text_local.contains("ssp_fmo_header_001.ghostpath\x01/opt/nanai/ghost/master\r\n"));
    assert!(text_local.contains("ssp_fmo_header_001.hwnd\x0112345\r\n"));
    assert!(text_local.contains("ssp_fmo_header_001.kerohwnd\x0167890\r\n"));
    assert!(text_local.contains("ssp_fmo_header_001.hwndlist\x0112345,67890\r\n"));

    // リモート出力 (機密パスの秘匿とHWNDのダミー化)
    let text_remote = format_fmo_text(&[rec], true);
    assert!(!text_remote.contains(".path\x01"));
    assert!(!text_remote.contains(".ghostpath\x01"));
    assert!(text_remote.contains("ssp_fmo_header_001.hwnd\x010\r\n"));
    assert!(text_remote.contains("ssp_fmo_header_001.kerohwnd\x010\r\n"));
    assert!(text_remote.contains("ssp_fmo_header_001.hwndlist\x010\r\n"));
    assert!(text_remote.contains("ssp_fmo_header_001.name\x01Nanai\r\n"));
}

#[test]
fn test_fmo_query_and_filtering_utilities() {
    let mut rec1 = FmoRecord::new("001", "Nanai");
    rec1.modulestate = Some("shiori:running,lifecycle:active".to_string());

    let mut rec2 = FmoRecord::new("002", "Emily");
    rec2.modulestate = Some("shiori:running,lifecycle:paused".to_string());

    let mut rec3 = FmoRecord::new("003", "Sakura");
    rec3.modulestate = Some("shiori:running,lifecycle:invisible".to_string());

    let records = vec![rec1, rec2, rec3];

    // has_ghost
    assert!(has_ghost(&records, "nanai"));
    assert!(has_ghost(&records, "EMILY"));
    assert!(has_ghost(&records, "Sakura"));
    assert!(!has_ghost(&records, "UnknownGhost"));

    // filter_active_records
    let active = filter_active_records(&records);
    let active_names: Vec<_> = active.iter().map(|r| r.name.as_str()).collect();
    assert_eq!(active_names, vec!["Nanai", "Sakura"]);

    // filter_visible_records
    let visible = filter_visible_records(&records);
    let visible_names: Vec<_> = visible.iter().map(|r| r.name.as_str()).collect();
    assert_eq!(visible_names, vec!["Nanai"]);

    // extract_ghost_names
    let names = extract_ghost_names(&records);
    assert_eq!(names, vec!["Emily", "Nanai", "Sakura"]);
}
