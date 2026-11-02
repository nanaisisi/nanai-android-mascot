use nanai_android_mascot_ui::InstallResourceConfig;
use std::collections::HashMap;

/// install.txt の規約に従い、同梱リソース (balloon, headline, plugin, shell, calendar.skin, calendar.plugin) を
/// 無印 → 0 → 1 → 2... の順に連続探索し、欠番が出た時点で打ち切る (refresh / refreshundeletemask 拡張対応)
pub fn resolve_bundled_resources_config(
    map: &HashMap<String, String>,
) -> Vec<InstallResourceConfig> {
    let supported_types = [
        "balloon",
        "headline",
        "plugin",
        "shell",
        "calendar.skin",
        "calendar.plugin",
    ];

    let mut result = Vec::new();

    for &r_type in &supported_types {
        // 1. 無印 (例: balloon.directory, balloon.refresh, balloon.refreshundeletemask)
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

            result.push(InstallResourceConfig {
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

                result.push(InstallResourceConfig {
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

    result
}
