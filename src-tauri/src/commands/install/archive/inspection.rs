use super::super::utils::*;

pub struct InstallInspectionResult {
    pub ghost_name: String,
    pub root_prefix: String,
    pub kind: String,
    pub target_base_path: String,
    pub safe_dir_name: String,
    pub alt_safe_name: String,
    pub bundled_resources: Vec<(String, std::path::PathBuf)>,
}

pub fn inspect_zip_archive<R: std::io::Read + std::io::Seek>(
    zip: &mut zip::ZipArchive<R>,
    fallback_name: &str,
    app_handle: &tauri::AppHandle,
) -> Result<InstallInspectionResult, String> {
    let mut best_install_idx: Option<(usize, usize)> = None;
    let mut best_descript_idx: Option<(usize, usize)> = None;

    for i in 0..zip.len() {
        if let Ok(entry) = zip.by_index(i) {
            let decoded_name = decode_zip_entry_name(entry.name_raw());
            let name = decoded_name.replace('\\', "/");
            let lower = name.to_lowercase();
            let depth = lower.matches('/').count();

            if lower == "install.txt" || lower.ends_with("/install.txt") {
                if best_install_idx.is_none_or(|(best_depth, _)| depth < best_depth) {
                    best_install_idx = Some((depth, i));
                }
            } else if lower == "descript.txt" || lower.ends_with("/descript.txt") {
                let prio = if lower.ends_with("ghost/master/descript.txt") {
                    0
                } else {
                    1 + depth
                };
                if best_descript_idx.is_none_or(|(best_prio, _)| prio < best_prio) {
                    best_descript_idx = Some((prio, i));
                }
            }
        }
    }

    let mut ghost_name = String::new();
    let mut root_prefix = String::new();
    let mut install_type: Option<String> = None;
    let mut install_directory: Option<String> = None;
    let mut bundled_resources_config: Vec<(String, String, String)> = Vec::new();

    if let Some((_, idx)) = best_install_idx
        && let Ok(mut entry) = zip.by_index(idx)
    {
        let name = decode_zip_entry_name(entry.name_raw()).replace('\\', "/");
        if let Some(slash_idx) = name.rfind('/') {
            root_prefix = name[..=slash_idx].to_string();
        }
        let map = parse_zip_entry_descript(&mut entry);

        if let Some(val) = map.get("name") {
            ghost_name = val.clone();
        }
        if let Some(val) = map.get("type") {
            install_type = Some(val.clone());
        }
        if let Some(val) = map.get("directory") {
            install_directory = Some(val.clone());
        }

        for (k, v) in &map {
            if k.ends_with(".directory") && !k.ends_with(".source.directory") {
                let prefix = &k[..k.len() - 10];
                let src_key = format!("{prefix}.source.directory");
                let src_dir = map.get(&src_key).unwrap_or(v).clone();
                let kind = prefix
                    .trim_end_matches(|c: char| c.is_ascii_digit())
                    .to_string();
                bundled_resources_config.push((kind, v.clone(), src_dir));
            }
        }
    }

    if ghost_name.is_empty()
        && let Some((_, idx)) = best_descript_idx
        && let Ok(mut entry) = zip.by_index(idx)
    {
        let map = parse_zip_entry_descript(&mut entry);
        if let Some(val) = map.get("name") {
            ghost_name = val.clone();
        }
        if install_type.is_none()
            && let Some(val) = map.get("type")
        {
            install_type = Some(val.clone());
        }
    }

    if ghost_name.is_empty() {
        ghost_name = fallback_name.to_string();
    }

    let kind = install_type
        .as_deref()
        .map(|s| s.split(',').next().unwrap_or(s).trim().to_lowercase())
        .unwrap_or_else(|| "ghost".to_string());
    if kind != "ghost"
        && kind != "balloon"
        && kind != "shell"
        && kind != "plugin"
        && kind != "headline"
        && kind != "supplement"
        && kind != "package"
    {
        let label = install_type.unwrap_or_default();
        return Err(format!(
            "install.txt type={label} ({kind}): サポートされていないアーカイブ種別です"
        ));
    }

    let raw_dir_name = install_directory
        .as_deref()
        .filter(|s| !s.trim().is_empty())
        .unwrap_or(&ghost_name);
    let safe_dir_name = sanitize_dir_name(raw_dir_name);
    let alt_safe_name = sanitize_dir_name(&ghost_name);

    let target_base_str = match kind.as_str() {
        "balloon" => "assets/balloon",
        "shell" => "assets/shell",
        "plugin" => "assets/plugin",
        "headline" => "assets/headline",
        _ => "assets/ghost",
    };

    let mut bundled_resources = Vec::new();
    if kind == "ghost" || kind == "package" || kind == "shell" {
        for (r_kind, b_dir, b_src_dir) in bundled_resources_config {
            let src_dir = b_src_dir.trim_matches('/').to_string();
            let dest_name = sanitize_dir_name(&b_dir);
            if !src_dir.is_empty() && !dest_name.is_empty() {
                let base_path = match r_kind.as_str() {
                    "balloon" => resolve_asset_path("assets/balloon", app_handle).ok(),
                    "headline" => resolve_asset_path("assets/headline", app_handle).ok(),
                    "plugin" => resolve_asset_path("assets/plugin", app_handle).ok(),
                    "shell" => resolve_asset_path("assets/shell", app_handle).ok(),
                    _ => None,
                };

                if let Some(base) = base_path {
                    let dest = base.join(&dest_name);
                    std::fs::create_dir_all(&dest).ok();
                    bundled_resources.push((format!("{src_dir}/"), dest));
                }
            }
        }
    }

    Ok(InstallInspectionResult {
        ghost_name,
        root_prefix,
        kind,
        target_base_path: target_base_str.to_string(),
        safe_dir_name,
        alt_safe_name,
        bundled_resources,
    })
}
