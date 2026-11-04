use super::*;

#[test]
fn test_generate_and_parse_fmo_buffer() {
    let records = vec![
        FmoRecord {
            id: "00004468_000f0dea".to_string(),
            path: "D:\\ssp\\".to_string(),
            hwnd: 986602,
            name: "ラーシェ".to_string(),
            keroname: "ティセ".to_string(),
            sakura_surface: 0,
            kero_surface: 10,
            ghostpath: "D:\\ssp\\ghost\\DE10_3001\\".to_string(),
            kerohwnd: Some(1052114),
            hwndlist: vec![986602, 1052114],
            fullname: Some("ラーシェとティセ".to_string()),
            modulestate: Some("shiori:running".to_string()),
        },
        FmoRecord {
            id: "00004468_00120da6".to_string(),
            path: "D:\\ssp\\".to_string(),
            hwnd: 1183142,
            name: "Emily".to_string(),
            keroname: "Teddy".to_string(),
            sakura_surface: 20,
            kero_surface: 10,
            ghostpath: "D:\\ssp\\ghost\\emily4\\".to_string(),
            kerohwnd: Some(1117626),
            hwndlist: vec![1183142, 1117626],
            fullname: None,
            modulestate: Some("shiori:running,makoto-ghost:running".to_string()),
        },
    ];

    let buf = generate_fmo_buffer(&records);
    assert_eq!(buf.len(), 65536);
    let size = u32::from_le_bytes([buf[0], buf[1], buf[2], buf[3]]);
    assert_eq!(size, 65536);

    let parsed = parse_fmo_buffer(&buf).unwrap();
    assert_eq!(parsed.len(), 2);

    assert_eq!(parsed[0].id, "00004468_000f0dea");
    assert_eq!(parsed[0].name, "ラーシェ");
    assert_eq!(parsed[0].keroname, "ティセ");
    assert_eq!(parsed[0].hwnd, 986602);
    assert_eq!(parsed[0].kerohwnd, Some(1052114));
    assert_eq!(parsed[0].hwndlist, vec![986602, 1052114]);
    assert_eq!(parsed[0].fullname, Some("ラーシェとティセ".to_string()));
    assert_eq!(parsed[0].modulestate, Some("shiori:running".to_string()));

    assert_eq!(parsed[1].id, "00004468_00120da6");
    assert_eq!(parsed[1].name, "Emily");
    assert_eq!(parsed[1].sakura_surface, 20);
    assert_eq!(parsed[1].kero_surface, 10);
    assert_eq!(
        parsed[1].modulestate,
        Some("shiori:running,makoto-ghost:running".to_string())
    );
}

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
}

#[test]
fn test_parse_fmo_buffer_error_on_small_buffer() {
    let small_buf = vec![0u8; 3];
    assert!(parse_fmo_buffer(&small_buf).is_err());
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
fn test_fmo_buffer_edge_cases() {
    // Prefix already starting with ssp_fmo_header_
    let mut rec = FmoRecord::new("ssp_fmo_header_already_prefixed", "Custom");
    rec.hwnd = 0; // test hwnd 0 branch in to_record / hwndlist
    let buf = generate_fmo_buffer(&[rec]);
    let parsed = parse_fmo_buffer(&buf).unwrap();
    assert_eq!(parsed.len(), 1);
    assert_eq!(parsed[0].name, "Custom");

    // Malformed line without \x01, or without dot in key
    let malformed_text =
        "4\0\0\0random_header_without_delimiter\r\nssp_fmo_header_no_dot\x01val\r\n";
    let mut padded = malformed_text.as_bytes().to_vec();
    padded.resize(65536, 0);
    let len_bytes = (padded.len() as u32).to_le_bytes();
    padded[0..4].copy_from_slice(&len_bytes);
    let res = parse_fmo_buffer(&padded).unwrap();
    assert_eq!(res.len(), 0);

    // serde deserialization of FmoEntry with defaults
    let json_minimal = r#"{"id":"test","name":"test","keroname":"","hwnd":0,"sakura_surface":0,"kero_surface":10,"ghostpath":"","balloon0":"","balloon1":""}"#;
    let entry_deser: FmoEntry = serde_json::from_str(json_minimal).unwrap();
    assert!(entry_deser.is_visible);
    assert_eq!(entry_deser.lifecycle_state, "active");
}

#[test]
fn test_fmo_buffer_more_edge_cases() {
    let recs = vec![FmoRecord {
        id: "custom_id_1".to_string(),
        path: "A".repeat(70000),
        hwnd: 123,
        name: "Name".to_string(),
        keroname: "Kero".to_string(),
        sakura_surface: 0,
        kero_surface: 10,
        ghostpath: "ghostpath".to_string(),
        kerohwnd: None,
        hwndlist: vec![],
        fullname: None,
        modulestate: None,
    }];

    let buf = generate_fmo_buffer(&recs);
    let parsed = parse_fmo_buffer(&buf).unwrap();
    assert_eq!(parsed.len(), 1);

    let malformed_lines = "ssp_fmo_header_nodot\x01val\r\nnodotfield\x01val\r\n";
    let mut padded = malformed_lines.as_bytes().to_vec();
    padded.resize(65536, 0);
    let len_bytes = (padded.len() as u32).to_le_bytes();
    padded[0..4].copy_from_slice(&len_bytes);
    let res = parse_fmo_buffer(&padded).unwrap();
    assert!(res.is_empty());
}

#[test]
fn test_fmo_buffer_uncovered_branches() {
    let raw_lines = "ssp_fmo_header_nodot\x01val\r\ncustom_prefix.sakura.surface\x015\r\nssp_fmo_header_dup.path\x01path1\r\nssp_fmo_header_dup.path\x01path2\r\n";
    let mut padded = raw_lines.as_bytes().to_vec();
    padded.resize(65536, 0);
    let len_bytes = (padded.len() as u32).to_le_bytes();
    padded[0..4].copy_from_slice(&len_bytes);
    let res = parse_fmo_buffer(&padded).unwrap();
    assert_eq!(res.len(), 2);
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
fn test_fmo_buffer_line107_and_144_coverage() {
    let raw_text = "ssp_fmo_header_nodot\x01val\r\nssp_fmo_header_dup1.name\x01Ghost1\r\ndup1.name\x01Ghost2\r\n";
    let mut padded = raw_text.as_bytes().to_vec();
    padded.resize(65536, 0);
    let len_bytes = (padded.len() as u32).to_le_bytes();
    padded[0..4].copy_from_slice(&len_bytes);

    let parsed = parse_fmo_buffer(&padded).unwrap();
    assert_eq!(parsed.len(), 1);
    assert_eq!(parsed[0].id, "dup1");
    assert_eq!(parsed[0].name, "Ghost1");
}
