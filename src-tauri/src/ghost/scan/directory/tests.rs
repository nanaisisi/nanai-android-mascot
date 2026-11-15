use super::manifest::parse_ghost_manifest;
use std::fs;

#[tokio::test]
async fn test_parallel_scan_multiple_ghosts() {
    let unique_id = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    let base_dir = std::env::temp_dir().join(format!("test_parallel_scan_{}", unique_id));
    fs::create_dir_all(&base_dir).expect("create base temp dir");

    // 3つのゴーストディレクトリを作成
    for name in &["ghost_alpha", "ghost_beta", "ghost_gamma"] {
        let ghost_dir = base_dir.join(name);
        let master_dir = ghost_dir.join("ghost").join("master");
        fs::create_dir_all(&master_dir).expect("create ghost master dir");

        let desc = format!("charset,UTF-8\r\nname,{}\r\nversion,1.0.0\r\n", name);
        fs::write(master_dir.join("descript.txt"), desc).expect("write descript");
    }

    // candidate_dirs を収集
    let mut candidate_dirs = Vec::new();
    if let Ok(entries) = std::fs::read_dir(&base_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                let dir_name = entry.file_name().to_string_lossy().to_string();
                if !dir_name.starts_with('.') {
                    candidate_dirs.push((path, dir_name));
                }
            }
        }
    }

    let mut join_set = tokio::task::JoinSet::new();
    for (path, dir_name) in candidate_dirs {
        join_set.spawn_blocking(move || {
            let manifest = parse_ghost_manifest(&path, &dir_name);
            manifest.display_name().to_string()
        });
    }

    let mut scanned_names = Vec::new();
    while let Some(res) = join_set.join_next().await {
        if let Ok(name) = res {
            scanned_names.push(name);
        }
    }

    scanned_names.sort();
    assert_eq!(
        scanned_names,
        vec!["ghost_alpha", "ghost_beta", "ghost_gamma"]
    );

    let _ = fs::remove_dir_all(&base_dir);
}
