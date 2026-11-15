use super::*;
use crate::shell::Shell;

/// 実プロジェクトのサンプルシェル
fn mock_shell_dir() -> std::path::PathBuf {
    std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("../../assets/ghost/mock_nanai/shell/master")
}

#[test]
fn test_manifest_from_synthetic() {
    let dir = std::env::temp_dir().join("nanai_manifest_test_shell");
    let _ = std::fs::remove_dir_all(&dir);
    std::fs::create_dir_all(&dir).unwrap();
    std::fs::write(
        dir.join("surfaces.txt"),
        "charset,Shift_JIS\nsurface0\n{\nelement0,base,surface0.png,0,0\ncollisionex0,head,rect,0,0,10,10\nanimation100.interval,bind\nanimation100.pattern0,add,100,0,0,0\n}\n",
    )
    .unwrap();
    std::fs::write(
        dir.join("descript.txt"),
        "type,shell\nname,manifest_test\ncraftmanw,Tester\n",
    )
    .unwrap();

    let shell = Shell::load(&dir).unwrap();
    let manifest = shell.manifest();

    assert_eq!(manifest.name(), "manifest_test");
    assert_eq!(manifest.craftman(), Some("Tester"));
    assert_eq!(
        manifest.descript().type_().map(|s| s.as_str()),
        Some("shell")
    );
    assert_eq!(manifest.surfaces().len(), 1);
    assert_eq!(manifest.surfaces()[0].number(), 0);
    assert_eq!(
        manifest.surfaces()[0]
            .definition()
            .element(0)
            .unwrap()
            .file(),
        "surface0.png"
    );
    assert_eq!(manifest.sakura_bind_groups().len(), 0);

    let json = serde_json::to_string(&manifest).unwrap();
    assert!(json.contains("\"surfaces\""));
    assert!(json.contains("surface0.png"));
    std::fs::remove_dir_all(&dir).ok();
}

#[test]
fn test_manifest_json_roundtrip_mock_nanai() {
    let dir = mock_shell_dir();
    let shell = Shell::load(&dir).unwrap();
    let manifest = shell.manifest();

    assert_eq!(manifest.name(), "master");
    let s0 = manifest
        .surfaces()
        .iter()
        .find(|s| s.number() == 0)
        .unwrap();
    assert!(
        s0.definition()
            .collisions()
            .iter()
            .any(|c| c.name() == "head")
    );
    assert!(s0.definition().animations().contains_key(&0));
    assert!(!manifest.sakura_bind_groups().is_empty());
    assert!(!manifest.kero_bind_groups().is_empty());
    assert!(manifest.surface_table().is_some());

    let json = serde_json::to_string(&manifest).unwrap();
    let back: ShellManifest = serde_json::from_str(&json).unwrap();
    assert_eq!(back, manifest);

    assert!(json.contains("surface0.png"));
}
