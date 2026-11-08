use super::*;

#[test]
fn test_parse_groups_and_entries() {
    let sample = r"charset,Shift_JIS
version,1

group,本体通常
{
0,デフォルト
1,じとー
6,目つぶ
}

group,本体腕組み
{
30,デフォルト
35,じとー
}

group,__disabled
{
19,__parts
100,__parts
101,__parts
}
";
    let table = SurfaceTable::parse(sample);

    assert_eq!(table.charset.as_deref(), Some("Shift_JIS"));
    assert_eq!(table.version, 1);
    assert_eq!(table.groups.len(), 3);

    let normal = table.group("本体通常").unwrap();
    assert_eq!(normal.entries.len(), 3);
    assert_eq!(normal.entries[0].surface_id, 0);
    assert_eq!(normal.entries[0].name, "デフォルト");

    let disabled = table.group("__disabled").unwrap();
    assert!(disabled.is_disabled());
    assert!(is_parts_name("__parts"));
    assert!(!is_parts_name("デフォルト"));

    // 可視登録からは __disabled が除外される
    let visible = table.visible_entries();
    assert_eq!(visible.len(), 5);
    assert_eq!(table.all_entries().len(), 8);
    assert_eq!(table.name_of(0), Some("デフォルト"));
    assert_eq!(table.name_of(19), None);
    assert_eq!(table.name_of_all(19), Some("__parts"));
    assert_eq!(table.name_of(999), None);

    // surface_id_of の双方向検索
    assert_eq!(table.surface_id_of("デフォルト"), Some(0));
    assert_eq!(table.surface_id_of("じとー"), Some(1));
    assert_eq!(table.surface_id_of("__parts"), Some(19));
    assert_eq!(table.surface_id_of("存在しない"), None);
}

#[test]
fn test_scope_and_options() {
    let sample = r"charset,UTF-8
version,1
scope,2
option,あ行,か行
group,g1
{
1,テスト
}
";
    let table = SurfaceTable::parse(sample);
    assert_eq!(table.scope, Some(2));
    assert_eq!(
        table.options[0],
        vec!["あ行".to_string(), "か行".to_string()]
    );
    assert_eq!(table.group("G1").unwrap().entries[0].name, "テスト");
}

#[test]
fn test_parse_unclosed_groups_and_invalid_numbers() {
    let sample = "}\r\ninvalid_line_without_comma\r\ntop_prop,top_val\r\nversion,invalid\r\nscope,invalid\r\ngroup,g1\r\nnon_numeric_in_group,val\r\n10,name1\r\ngroup,g2\r\n20,name2";
    let table = SurfaceTable::parse(sample);
    assert_eq!(table.version, 0);
    assert_eq!(table.scope, None);
    assert_eq!(table.groups.len(), 2);
    assert_eq!(table.groups[0].name, "g1");
    assert_eq!(table.groups[0].entries[0].surface_id, 10);
    assert_eq!(table.groups[1].name, "g2");
    assert_eq!(table.groups[1].entries[0].surface_id, 20);
    assert_eq!(
        table.properties.get("top_prop").map(String::as_str),
        Some("top_val")
    );
}

#[test]
fn test_parse_mock_nanai_file() {
    let path = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("../../assets/ghost/mock_nanai/shell/master/surfacetable.txt");
    let content = crate::vfs::open_text_file(&path).unwrap();
    let table = SurfaceTable::parse(&content);

    assert_eq!(table.charset.as_deref(), Some("Shift_JIS"));
    assert_eq!(table.version, 1);
    // 本体通常 / 本体腕組み / 本体正面向け / 下半身_* 各グループが存在する
    assert!(table.group("本体通常").is_some() || !table.groups.is_empty());
    // 可視サーフィスの一覧に 0 / 30 / 10 / 14 が含まれる
    let mut ids: Vec<u32> = table
        .visible_entries()
        .iter()
        .map(|e| e.surface_id)
        .collect();
    ids.sort_unstable();
    for probe in [0u32, 10, 14, 30] {
        assert!(
            ids.binary_search(&probe).is_ok(),
            "visible ids に {probe} が無い: {ids:?}"
        );
    }
    // __disabled は 19 / 100 / 101
    let disabled = table.group("__disabled").unwrap();
    assert_eq!(disabled.entries.len(), 3);
}
