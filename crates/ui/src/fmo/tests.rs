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
