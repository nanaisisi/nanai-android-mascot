/**
 * @file buffer_processing.rs
 * @brief FMO 共有メモリバッファ (64KB Little-Endian) 生成・パース単体テスト
 */
use super::*;

#[test]
fn test_generate_and_parse_fmo_buffer() {
    let records = vec![
        FmoRecord {
            id: "00004468_000f0dea".to_string(),
            path: "D:\\ssp\\".to_string(),
            hwnd: 986602,
            name: "SampleGhost".to_string(),
            keroname: "SampleKero".to_string(),
            sakura_surface: 0,
            kero_surface: 10,
            ghostpath: "D:\\ssp\\ghost\\DE10_3001\\".to_string(),
            kerohwnd: Some(1052114),
            hwndlist: vec![986602, 1052114],
            fullname: Some("SampleGhost and SampleKero".to_string()),
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
    assert_eq!(parsed[0].name, "SampleGhost");
    assert_eq!(parsed[0].keroname, "SampleKero");
    assert_eq!(parsed[0].hwnd, 986602);
    assert_eq!(parsed[0].kerohwnd, Some(1052114));
    assert_eq!(parsed[0].hwndlist, vec![986602, 1052114]);
    assert_eq!(
        parsed[0].fullname,
        Some("SampleGhost and SampleKero".to_string())
    );
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
fn test_parse_fmo_buffer_error_on_small_buffer() {
    let small_buf = vec![0u8; 3];
    assert!(parse_fmo_buffer(&small_buf).is_err());
}

#[test]
fn test_fmo_buffer_edge_cases() {
    // Prefix already starting with ssp_fmo_header_
    let mut rec = FmoRecord::new("ssp_fmo_header_already_prefixed", "Custom");
    rec.hwnd = 0;
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
