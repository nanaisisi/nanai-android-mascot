//! makoto.dll（トランスレータ）の外部ファイル探索。
//! DLL の動的ロードは Android 等では不可のため、配置検出と適用順序の決定のみ行う。

use std::path::{Path, PathBuf};

/// ゴースト側 `ghost/master/makoto.dll`（`descript.txt` の makoto キー優先）を探す。
pub fn find_ghost_makoto(ghost_dir: &Path, descript_makoto: Option<&str>) -> Option<PathBuf> {
    let master = ghost_dir.join("ghost").join("master");
    let name = descript_makoto
        .filter(|s| !s.is_empty())
        .unwrap_or("makoto.dll");
    let p = master.join(name);
    p.is_file().then_some(p)
}

/// シェル側 `shell/<name>/makoto.dll` を探す。
pub fn find_shell_makoto(shell_dir: &Path) -> Option<PathBuf> {
    let p = shell_dir.join("makoto.dll");
    p.is_file().then_some(p)
}

/// 適用順序: SHIORI OnTranslate → ゴースト側 → シェル側。
pub fn translate_order(ghost: bool, shell: bool) -> Vec<&'static str> {
    let mut v = vec!["shiori"];
    if ghost {
        v.push("ghost");
    }
    if shell {
        v.push("shell");
    }
    v
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn detects_files_and_order() {
        let t = std::env::temp_dir().join("nam_makoto_test");
        let _ = std::fs::remove_dir_all(&t);
        std::fs::create_dir_all(t.join("ghost/master")).unwrap();
        std::fs::create_dir_all(t.join("shell/master")).unwrap();
        assert!(find_ghost_makoto(&t, None).is_none());
        std::fs::write(t.join("ghost/master/makoto.dll"), b"x").unwrap();
        std::fs::write(t.join("shell/master/makoto.dll"), b"x").unwrap();
        assert!(find_ghost_makoto(&t, None).is_some());
        assert!(find_shell_makoto(&t.join("shell/master")).is_some());
        assert_eq!(translate_order(true, true), ["shiori", "ghost", "shell"]);
        let _ = std::fs::remove_dir_all(&t);
    }
}
