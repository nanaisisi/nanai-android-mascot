/**
 * @file records_entries.rs
 * @brief FmoRecord / FmoEntry 相互変換・ライフサイクル状態・テキストフォーマット単体テスト
 */

use super::*;

#[test]
fn test_fmo_constants_and_constructors() {
    assert_eq!(MUTEX_SSP, "ssp");
    assert_eq!(MUTEX_SAKURA, "sakura");
    assert_eq!(MUTEX_SAKURA_FMO, "SakuraFMO");
    assert_eq!(MUTEX_SAKURA_UNICODE_FMO, "SakuraUnicodeFMO");

    let rec = FmoRecord::new("ghost_01", "Nanai");
    assert_eq!(rec.id, "ghost_01");
    assert_eq!(rec.name, "Nanai");
    assert_eq!(rec.sakura_surface, 0);
    assert_eq!(rec.kero_surface, 10);

    // FmoRecord builders
    let built_rec = FmoRecord::new("1", "Ghost1")
        .with_surfaces(10, 20)
        .with_hwnd(1234, Some(5678))
        .with_paths("/path/ghost", "/ghostpath")
        .with_modulestate("shiori:running");
    assert_eq!(built_rec.sakura_surface, 10);
    assert_eq!(built_rec.kero_surface, 20);
    assert_eq!(built_rec.hwnd, 1234);
    assert_eq!(built_rec.kerohwnd, Some(5678));
    assert_eq!(built_rec.hwndlist, vec![1234, 5678]);
    assert_eq!(built_rec.path, "/path/ghost");
    assert_eq!(built_rec.ghostpath, "/ghostpath");
    assert_eq!(built_rec.modulestate, Some("shiori:running".to_string()));

    // FmoEntry builders
    let built_entry = FmoEntry::new("2", "Ghost2")
        .with_surfaces(3, 4)
        .with_balloons("Hello", "World")
        .with_hwnd(999, None)
        .with_ghostpath("/gp2")
        .with_modulestate("state:active");
    assert_eq!(built_entry.sakura_surface, 3);
    assert_eq!(built_entry.kero_surface, 4);
    assert_eq!(built_entry.balloon0, "Hello");
    assert_eq!(built_entry.balloon1, "World");
    assert_eq!(built_entry.hwnd, 999);
    assert_eq!(built_entry.ghostpath, "/gp2");
    assert_eq!(built_entry.modulestate, Some("state:active".to_string()));

    // Record search helpers
    let records = vec![built_rec.clone(), FmoRecord::new("2", "SecondGhost")];
    assert_eq!(find_record_by_name(&records, "ghost1"), Some(&built_rec));
    assert_eq!(find_record_by_name(&records, "nonexistent"), None);
    assert_eq!(find_record_by_hwnd(&records, 1234), Some(&built_rec));
    assert_eq!(find_record_by_hwnd(&records, 5678), Some(&built_rec));
    assert_eq!(find_record_by_hwnd(&records, 0), None);
    assert_eq!(find_record_by_hwnd(&records, 9999), None);
}

#[test]
fn test_fmo_entry_conversion_and_sync() {
    let entry = FmoEntry {
        id: "ghost_nanai".to_string(),
        name: "Nanai".to_string(),
        keroname: "Kero".to_string(),
        hwnd: 54321,
        sakura_surface: 5,
        kero_surface: 15,
        ghostpath: "/app/assets/ghost/nanai/".to_string(),
        balloon0: "Hello".to_string(),
        balloon1: "KeroHi".to_string(),
        kerohwnd: None,
        modulestate: None,
        is_visible: true,
        lifecycle_state: "active".to_string(),
    };

    let rec = entry.to_record();
    assert_eq!(rec.id, "ghost_nanai");
    assert_eq!(rec.name, "Nanai");
    assert_eq!(rec.keroname, "Kero");
    assert_eq!(rec.hwnd, 54321);
    assert_eq!(rec.sakura_surface, 5);
    assert_eq!(rec.kero_surface, 15);
    assert_eq!(rec.ghostpath, "/app/assets/ghost/nanai/");
    assert_eq!(rec.hwndlist, vec![54321]);

    let entry_back = FmoEntry::from_record(&rec);
    assert_eq!(entry_back.id, entry.id);
    assert_eq!(entry_back.name, entry.name);
    assert_eq!(entry_back.keroname, entry.keroname);
    assert_eq!(entry_back.hwnd, entry.hwnd);
    assert_eq!(entry_back.sakura_surface, entry.sakura_surface);
    assert_eq!(entry_back.kero_surface, entry.kero_surface);
    assert_eq!(entry_back.ghostpath, entry.ghostpath);
    assert!(entry_back.is_visible);
    assert_eq!(entry_back.lifecycle_state, "active");
}

#[test]
fn test_fmo_entry_kerohwnd_and_modulestate_sync() {
    let mut entry = FmoEntry::new("ghost_02", "Emily");
    entry.keroname = "Teddy".to_string();
    entry.hwnd = 10001;
    entry.kerohwnd = Some(10002);
    entry.modulestate = Some("shiori:running".to_string());

    let rec = entry.to_record();
    assert_eq!(rec.kerohwnd, Some(10002));
    assert_eq!(rec.hwndlist, vec![10001, 10002]);
    assert_eq!(rec.modulestate, Some("shiori:running".to_string()));

    let back = FmoEntry::from_record(&rec);
    assert_eq!(back.kerohwnd, Some(10002));
    assert_eq!(back.modulestate, Some("shiori:running".to_string()));
}

#[test]
fn test_fmo_entry_lifecycle_and_mobile_optimization() {
    let mut entry = FmoEntry::new("ghost_mobile", "Nanai");
    assert!(entry.is_visible);
    assert_eq!(entry.lifecycle_state, "active");

    entry.update_lifecycle("paused", false);
    assert!(!entry.is_visible);
    assert_eq!(entry.lifecycle_state, "paused");
    assert!(
        entry
            .modulestate
            .as_ref()
            .unwrap()
            .contains("lifecycle:paused")
    );

    let rec = entry.to_record();
    let back = FmoEntry::from_record(&rec);
    assert_eq!(back.lifecycle_state, "paused");
    assert!(!back.is_visible);

    entry.update_lifecycle("active", true);
    assert!(entry.is_visible);
    assert_eq!(entry.lifecycle_state, "active");
    assert!(
        entry
            .modulestate
            .as_ref()
            .unwrap()
            .contains("lifecycle:active")
    );
    assert!(
        !entry
            .modulestate
            .as_ref()
            .unwrap()
            .contains("lifecycle:paused")
    );

    // stopped and invisible states
    entry.update_lifecycle("stopped", false);
    let rec_stopped = entry.to_record();
    let back_stopped = FmoEntry::from_record(&rec_stopped);
    assert_eq!(back_stopped.lifecycle_state, "stopped");
    assert!(!back_stopped.is_visible);

    entry.update_lifecycle("invisible", false);
    let rec_invis = entry.to_record();
    let back_invis = FmoEntry::from_record(&rec_invis);
    assert_eq!(back_invis.lifecycle_state, "invisible");
    assert!(!back_invis.is_visible);
}

#[test]
fn test_fmo_types_edge_cases() {
    let mut entry = FmoEntry::new("test_0", "Name");
    entry.hwnd = 0;
    entry.kerohwnd = Some(123);
    let rec = entry.to_record();
    assert_eq!(rec.hwndlist, vec![123]);

    entry.hwnd = 123;
    entry.kerohwnd = Some(123); // duplicate
    let rec2 = entry.to_record();
    assert_eq!(rec2.hwndlist, vec![123]);

    entry.kerohwnd = Some(0); // zero kerohwnd
    let rec3 = entry.to_record();
    assert_eq!(rec3.hwndlist, vec![123]);

    let mut rec_mod = FmoRecord::new("test_mod", "Mod");
    rec_mod.modulestate = Some("custom:running,other_part".to_string());
    let entry_mod = FmoEntry::from_record(&rec_mod);
    assert!(entry_mod.is_visible);
    assert_eq!(entry_mod.lifecycle_state, "active");

    let mut entry_lifecycle = FmoEntry::new("test_lc", "LC");
    entry_lifecycle.update_lifecycle("paused", false);
    entry_lifecycle.update_lifecycle("paused", false);
    assert_eq!(entry_lifecycle.lifecycle_state, "paused");

    let mut entry_lifecycle2 = FmoEntry::new("test_lc2", "LC2");
    entry_lifecycle2.modulestate = Some("shiori:running,lifecycle:old".to_string());
    entry_lifecycle2.update_lifecycle("active", true);
    assert_eq!(entry_lifecycle2.lifecycle_state, "active");
}

#[test]
fn test_fmo_types_lifecycle_variations() {
    let mut rec = FmoRecord::new("test_var", "Var");
    rec.modulestate = Some("shiori:running,lifecycle:active".to_string());
    let entry = FmoEntry::from_record(&rec);
    assert!(entry.is_visible);
    assert_eq!(entry.lifecycle_state, "active");

    rec.modulestate = Some("shiori:running,lifecycle:unknown".to_string());
    let entry2 = FmoEntry::from_record(&rec);
    assert!(entry2.is_visible);
    assert_eq!(entry2.lifecycle_state, "unknown");
}

#[test]
fn test_fmo_types_stopped_invisible() {
    let mut rec = FmoRecord::new("test_si", "SI");
    rec.modulestate = Some("lifecycle:stopped".to_string());
    let entry_stop = FmoEntry::from_record(&rec);
    assert!(!entry_stop.is_visible);
    assert_eq!(entry_stop.lifecycle_state, "stopped");

    rec.modulestate = Some("lifecycle:invisible".to_string());
    let entry_invis = FmoEntry::from_record(&rec);
    assert!(!entry_invis.is_visible);
    assert_eq!(entry_invis.lifecycle_state, "invisible");
}

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

    // リモート出力
    let text_remote = format_fmo_text(&[rec], true);
    assert!(!text_remote.contains(".path\x01"));
    assert!(!text_remote.contains(".ghostpath\x01"));
    assert!(text_remote.contains("ssp_fmo_header_001.hwnd\x010\r\n"));
    assert!(text_remote.contains("ssp_fmo_header_001.kerohwnd\x010\r\n"));
    assert!(text_remote.contains("ssp_fmo_header_001.hwndlist\x010\r\n"));
    assert!(text_remote.contains("ssp_fmo_header_001.name\x01Nanai\r\n"));
}
