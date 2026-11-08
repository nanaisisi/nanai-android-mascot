use crate::update::types::{InstallManifest, InstallResourceConfig, UpdateEntry};
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

/// updates2.dau (updates2dau) または updates.txt (updatestxt) の内容をパース
pub fn parse_update_definition(content: &str) -> Vec<UpdateEntry> {
    let mut entries = Vec::new();
    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }

        // updates.txt の場合: "file," プレフィックス
        let data_part = if let Some(stripped) = trimmed.strip_prefix("file,") {
            stripped
        } else if trimmed.starts_with("charset,") {
            continue;
        } else {
            trimmed
        };

        // 区切り文字: \x01 (Byte 1) または カンマフォールバック
        let parts: Vec<&str> = if data_part.contains('\x01') {
            data_part.split('\x01').collect()
        } else {
            data_part.split(',').collect()
        };

        let rel_path = parts[0].trim().replace('\\', "/");
        if rel_path.is_empty() {
            continue;
        }

        let md5_hash = if parts.len() > 1 {
            parts[1].trim().to_lowercase()
        } else {
            String::new()
        };

        // [相対パス,ignore], [補足]: updates_def.txt / updates2.dau における相対パス指定、ignore, readonly, delete, size, date パラメータパース
        let mut is_delete = false;
        let mut is_ignore = false;
        let mut is_readonly = false;
        let mut option_flags = Vec::new();
        let mut size = None;
        let mut date = None;

        for &extra in parts.iter().skip(2) {
            let extra_trimmed = extra.trim();
            if extra_trimmed.is_empty() {
                continue;
            }
            if let Some(s) = extra_trimmed.strip_prefix("size=") {
                if let Ok(val) = s.parse::<u64>() {
                    size = Some(val);
                }
            } else if let Some(d) = extra_trimmed.strip_prefix("date=") {
                date = Some(d.to_string());
            } else if extra_trimmed.starts_with("charset=") {
                continue;
            } else if extra_trimmed.eq_ignore_ascii_case("delete") {
                is_delete = true;
                option_flags.push("delete".to_string());
            } else if extra_trimmed.eq_ignore_ascii_case("ignore") {
                is_ignore = true;
                option_flags.push("ignore".to_string());
            } else if extra_trimmed.eq_ignore_ascii_case("readonly") {
                is_readonly = true;
                option_flags.push("readonly".to_string());
            }
        }

        entries.push(UpdateEntry {
            path: rel_path,
            md5: md5_hash,
            size,
            is_delete,
            is_ignore,
            is_readonly,
            date,
            flags: option_flags,
        });
    }
    entries
}

/// developer_options.txt の内容をパースし、noupdate= で指定された除外ファイルパターン一覧を抽出
pub fn parse_developer_options(content: &str) -> Vec<String> {
    let mut noupdate_files = Vec::new();
    for line in content.lines() {
        let trimmed = line.trim().trim_start_matches('\u{feff}');
        if trimmed.is_empty() || trimmed.starts_with("//") || trimmed.starts_with('#') {
            continue;
        }
        if let Some(stripped) = trimmed.strip_prefix("noupdate=") {
            let file_pattern = stripped.trim().replace('\\', "/");
            if !file_pattern.is_empty() {
                noupdate_files.push(file_pattern);
            }
        } else if let Some((key, val)) = trimmed.split_once(',').or_else(|| trimmed.split_once(':'))
            && key.trim().eq_ignore_ascii_case("noupdate")
        {
            let file_pattern = val.trim().replace('\\', "/");
            if !file_pattern.is_empty() {
                noupdate_files.push(file_pattern);
            }
        }
    }
    noupdate_files
}
