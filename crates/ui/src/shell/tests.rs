use super::*;
use std::path::{Path, PathBuf};

/// 実プロジェクトのサンプルシェル
fn mock_shell_dir() -> PathBuf {
    std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("../../assets/ghost/mock_nanai/shell/master")
}

#[test]
fn test_load_mock_shell() {
    let dir = mock_shell_dir();
    let shell = Shell::load(&dir).unwrap();

    assert_eq!(shell.directory_name(), "master");
    assert_eq!(shell.descript.type_().map(|s| s.as_str()), Some("shell"));
    assert_eq!(shell.display_name(), "master");
    assert!(shell.craftman().is_some());

    // surfaces.txt の基本定義
    let def0 = shell.surface(0).unwrap();
    assert!(def0.element(0).is_some());
    assert!(def0.collisions.iter().any(|c| c.name == "head"));

    // hit_test
    assert_eq!(
        shell.hit_test(0, 90, 40).map(|c| c.name.as_str()),
        Some("head")
    );
    assert_eq!(shell.hit_test(0, -99, -99), None);

    // 着せ替え定義（mock_nanai は sakura / kero とも bindgroup を持つ）
    assert!(!shell.sakura_bind_groups().is_empty());
    assert!(!shell.kero_bind_groups().is_empty());

    // 既定装着の bind id と合成計画
    let default_id = shell.default_bind_ids("sakura")[0];
    let plan = shell.composition_plan(0, &[default_id]).unwrap();
    assert!(plan.bind_pattern_count() >= 1);

    // surfacetable.txt も存在する（グループ一覧）
    let table = shell.surface_table.as_ref().unwrap();
    assert_eq!(table.version, 1);
    assert!(!table.visible_entries().is_empty());

    // アセット解決（VFS 大文字小文字吸収含む）
    assert!(shell.resolve_asset("surface0.png").is_some());
    assert!(shell.resolve_asset("Surface0.PNG").is_some());
    let _ = shell.alias_surface("non_existent_alias");
}

#[test]
fn test_load_missing_directory() {
    let err = Shell::load(Path::new("definitely/not/exist")).unwrap_err();
    assert_eq!(err.kind(), std::io::ErrorKind::NotFound);

    let empty_dir = std::env::temp_dir().join("nanai_empty_shell_dir");
    let _ = std::fs::remove_dir_all(&empty_dir);
    std::fs::create_dir_all(&empty_dir).unwrap();
    let err2 = Shell::load(&empty_dir).unwrap_err();
    assert_eq!(err2.kind(), std::io::ErrorKind::NotFound);

    // descript.txt がディレクトリである異常系と name 指定ありのケース
    std::fs::create_dir_all(empty_dir.join("descript.txt")).unwrap();
    std::fs::write(empty_dir.join("surfaces.txt"), "surface0\n{\n}\n").unwrap();
    let shell_no_desc = Shell::load(&empty_dir).unwrap();
    assert_eq!(shell_no_desc.display_name(), "nanai_empty_shell_dir");

    std::fs::remove_dir_all(empty_dir.join("descript.txt")).unwrap();
    std::fs::write(empty_dir.join("descript.txt"), "name,CustomShellName\n").unwrap();
    let shell_named = Shell::load(&empty_dir).unwrap();
    assert_eq!(shell_named.display_name(), "CustomShellName");

    let _ = std::fs::remove_dir_all(&empty_dir);
}

#[test]
fn test_shell_hit_test_results_and_surfaces2() {
    let empty_dir = std::env::temp_dir().join("nanai_shell_s2_dir");
    let _ = std::fs::remove_dir_all(&empty_dir);
    std::fs::create_dir_all(&empty_dir).unwrap();
    std::fs::write(empty_dir.join("surfaces.txt"), "surface0\n{\ncollision0,0,0,50,50,Head\n}\n").unwrap();
    std::fs::write(empty_dir.join("surfaces2.txt"), "surface0\n{\ncollision1,10,10,20,20,Extra\n}\n").unwrap();

    let shell = Shell::load(&empty_dir).unwrap();
    assert!(shell.hit_test_result(0, 25, 25).is_some());
    assert!(shell.hit_test_with_binds(0, 25, 25, &[]).is_some());

    let _ = std::fs::remove_dir_all(&empty_dir);
}
