use crate::commands::install::archive::inspection::resolve_bundled_resources_config;
use std::collections::HashMap;

#[test]
fn test_resolve_bundled_resources_config_sequential() {
    let mut map = HashMap::new();
    map.insert("name".to_string(), "Test".to_string());
    map.insert("type".to_string(), "ghost".to_string());
    map.insert("balloon.directory".to_string(), "balloon_main".to_string());
    map.insert("balloon.refresh".to_string(), "1".to_string());
    map.insert(
        "balloon.refreshundeletemask".to_string(),
        "keep.txt:save.dat".to_string(),
    );
    map.insert("balloon0.directory".to_string(), "balloon_zero".to_string());
    map.insert(
        "balloon0.source.directory".to_string(),
        "custom_b0".to_string(),
    );
    map.insert("balloon1.directory".to_string(), "balloon_one".to_string());
    map.insert(
        "balloon3.directory".to_string(),
        "balloon_three".to_string(),
    ); // 2が欠番なのでスキップされる
    map.insert(
        "calendar.skin0.directory".to_string(),
        "cal_skin".to_string(),
    );
    map.insert(
        "calendar.plugin0.directory".to_string(),
        "cal_plugin".to_string(),
    );

    let res = resolve_bundled_resources_config(&map);
    assert_eq!(res.len(), 5);

    assert_eq!(res[0].resource_type, "balloon");
    assert_eq!(res[0].target_directory, "balloon_main");
    assert_eq!(res[0].source_directory, "balloon_main");
    assert!(res[0].refresh);
    assert_eq!(res[0].refresh_undelete_mask, vec!["keep.txt", "save.dat"]);

    assert_eq!(res[1].resource_type, "balloon");
    assert_eq!(res[1].target_directory, "balloon_zero");
    assert_eq!(res[1].source_directory, "custom_b0");
    assert!(!res[1].refresh);

    assert_eq!(res[2].resource_type, "balloon");
    assert_eq!(res[2].target_directory, "balloon_one");
    assert_eq!(res[2].source_directory, "balloon_one");

    assert_eq!(res[3].resource_type, "calendar.skin");
    assert_eq!(res[3].target_directory, "cal_skin");

    assert_eq!(res[4].resource_type, "calendar.plugin");
    assert_eq!(res[4].target_directory, "cal_plugin");
}

#[test]
fn test_inspect_extended_options_and_refresh() {
    let mut map = HashMap::new();
    map.insert("name".to_string(), "ExtendedGhost".to_string());
    map.insert("type".to_string(), "package".to_string());
    map.insert("bootghost".to_string(), "master_ghost".to_string());
    map.insert("accept".to_string(), "Nanai".to_string());
    map.insert("refresh".to_string(), "1".to_string());
    map.insert(
        "refreshundeletemask".to_string(),
        "important.dat:config.xml".to_string(),
    );

    let res = resolve_bundled_resources_config(&map);
    assert!(res.is_empty());

    assert_eq!(
        map.get("bootghost").map(|s| s.as_str()),
        Some("master_ghost")
    );
    assert_eq!(map.get("accept").map(|s| s.as_str()), Some("Nanai"));
    assert_eq!(map.get("refresh").map(|s| s.as_str()), Some("1"));
    let masks: Vec<String> = map
        .get("refreshundeletemask")
        .unwrap()
        .split(':')
        .map(|s| s.to_string())
        .collect();
    assert_eq!(masks, vec!["important.dat", "config.xml"]);
}
