use super::parser::parse_ghost_manifest;
use std::fs;

#[test]
fn test_parse_ghost_manifest_with_makoto() {
    let unique_id = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    let dir = std::env::temp_dir().join(format!("test_manifest_makoto_{}", unique_id));
    let master_dir = dir.join("ghost").join("master");
    fs::create_dir_all(&master_dir).expect("create master dir");

    let descript_content = "\
charset,UTF-8\r\n\
name,テストゴースト\r\n\
shiori,yaya.dll\r\n\
makoto,makoto.dll\r\n\
craftman,整備者\r\n\
";
    fs::write(master_dir.join("descript.txt"), descript_content).expect("write descript");

    let manifest = parse_ghost_manifest(&dir, "test_ghost");
    assert_eq!(manifest.display_name(), "テストゴースト");
    assert_eq!(manifest.shiori(), Some("yaya.dll"));
    assert_eq!(manifest.makoto(), Some("makoto.dll"));
    assert_eq!(manifest.craftman(), Some("整備者"));

    let _ = fs::remove_dir_all(&dir);
}

#[test]
fn test_parse_ghost_manifest_without_makoto() {
    let unique_id = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    let dir = std::env::temp_dir().join(format!("test_manifest_no_makoto_{}", unique_id));
    let master_dir = dir.join("ghost").join("master");
    fs::create_dir_all(&master_dir).expect("create master dir");

    let descript_content = "\
charset,UTF-8\r\n\
name,シンプルゴースト\r\n\
shiori,shiori.dll\r\n\
";
    fs::write(master_dir.join("descript.txt"), descript_content).expect("write descript");

    let manifest = parse_ghost_manifest(&dir, "simple_ghost");
    assert_eq!(manifest.display_name(), "シンプルゴースト");
    assert_eq!(manifest.shiori(), Some("shiori.dll"));
    assert_eq!(manifest.makoto(), None);

    let _ = fs::remove_dir_all(&dir);
}
