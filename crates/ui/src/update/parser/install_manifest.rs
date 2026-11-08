//! install.txt マニフェストパース処理モジュール

use crate::update::types::{InstallManifest, InstallResourceConfig};
use std::collections::HashMap;

/// install.txt の内容をパースして InstallManifest を構築
pub fn parse_install_manifest(content: &str) -> InstallManifest {
    let mut map: HashMap<String, String> = HashMap::new();
    for line in content.lines() {
        let trimmed = line.trim().trim_start_matches('\u{feff}');
        if trimmed.is_empty() || trimmed.starts_with("//") || trimmed.starts_with('#') {
            continue;
        }
        if let Some((key, val)) = trimmed.split_once(',').or_else(|| trimmed.split_once(':')) {
            let k = key.trim().to_lowercase();
            let v = val.trim().trim_end_matches(',').trim().to_string();
            if !k.is_empty() && !v.is_empty() {
                map.insert(k, v);
            }
        }
    }

    let name = map.get("name").cloned().unwrap_or_default();
    let install_type = map
        .get("type")
        .cloned()
        .unwrap_or_else(|| "ghost".to_string());
    let directory = map.get("directory").cloned();
    let charset = map.get("charset").cloned();
    let accept = map
        .get("accept")
        .cloned()
        .or_else(|| map.get("install.accept").cloned());
    let bootghost = map.get("bootghost").cloned();
    let notice = map.get("notice").cloned();
    let readme = map.get("readme").cloned();
    let execute = map.get("execute").cloned();
    let oninstall_script = map
        .get("oninstall.script")
        .cloned()
        .or_else(|| map.get("oninstallscript").cloned());
    let onuninstall_script = map
        .get("onuninstall.script")
        .cloned()
        .or_else(|| map.get("onuninstallscript").cloned());

    let refresh = map.get("refresh").is_some_and(|v| v.trim() == "1");
    let refresh_undelete_mask: Vec<String> = map
        .get("refreshundeletemask")
        .map(|v| {
            v.split(':')
                .map(|s| s.trim().to_string())
                .filter(|s| !s.is_empty())
                .collect()
        })
        .unwrap_or_default();

    // 同梱リソース (無印および 0, 1, 2...)
    let supported_types = [
        "balloon",
        "headline",
        "plugin",
        "shell",
        "calendar.skin",
        "calendar.plugin",
    ];

    let mut bundled_resources = Vec::new();

    for &r_type in &supported_types {
        // 1. 無印 (例: balloon.directory)
        let unnumbered_dir_key = format!("{r_type}.directory");
        if let Some(target_dir) = map.get(&unnumbered_dir_key) {
            let src_key = format!("{r_type}.source.directory");
            let src_dir = map.get(&src_key).unwrap_or(target_dir).clone();
            let r_refresh = map
                .get(&format!("{r_type}.refresh"))
                .is_some_and(|v| v.trim() == "1");
            let r_mask: Vec<String> = map
                .get(&format!("{r_type}.refreshundeletemask"))
                .map(|v| {
                    v.split(':')
                        .map(|s| s.trim().to_string())
                        .filter(|s| !s.is_empty())
                        .collect()
                })
                .unwrap_or_default();

            bundled_resources.push(InstallResourceConfig {
                resource_type: r_type.to_string(),
                target_directory: target_dir.clone(),
                source_directory: src_dir,
                refresh: r_refresh,
                refresh_undelete_mask: r_mask,
            });
        }

        // 2. 0, 1, 2... の連番探索（欠番が出た時点で打ち切り）
        let mut idx = 0;
        loop {
            let indexed_dir_key = format!("{r_type}{idx}.directory");
            if let Some(target_dir) = map.get(&indexed_dir_key) {
                let src_key = format!("{r_type}{idx}.source.directory");
                let src_dir = map.get(&src_key).unwrap_or(target_dir).clone();
                let r_refresh = map
                    .get(&format!("{r_type}{idx}.refresh"))
                    .is_some_and(|v| v.trim() == "1");
                let r_mask: Vec<String> = map
                    .get(&format!("{r_type}{idx}.refreshundeletemask"))
                    .map(|v| {
                        v.split(':')
                            .map(|s| s.trim().to_string())
                            .filter(|s| !s.is_empty())
                            .collect()
                    })
                    .unwrap_or_default();

                bundled_resources.push(InstallResourceConfig {
                    resource_type: r_type.to_string(),
                    target_directory: target_dir.clone(),
                    source_directory: src_dir,
                    refresh: r_refresh,
                    refresh_undelete_mask: r_mask,
                });
                idx += 1;
            } else {
                break;
            }
        }
    }

    InstallManifest {
        name,
        install_type,
        directory,
        charset,
        accept,
        bootghost,
        refresh,
        refresh_undelete_mask,
        notice,
        readme,
        execute,
        oninstall_script,
        onuninstall_script,
        bundled_resources,
    }
}
