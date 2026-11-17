pub fn format_system_time(sys_time: std::time::SystemTime) -> Option<String> {
    let dur = sys_time.duration_since(std::time::UNIX_EPOCH).ok()?;
    let secs = dur.as_secs();

    // 1971年以前 (エポック秒 86400 * 365 未満、例: 1970/01/01 09:00:00) のファイルメタデータ未取得・ダミー初期値は無効/未設定扱い
    if secs < 86400 * 365 {
        return None;
    }

    let days = secs / 86400;
    let remainder = secs % 86400;
    let hours = remainder / 3600;
    let minutes = (remainder % 3600) / 60;
    let seconds = remainder % 60;

    let mut year = 1970;
    let mut remaining_days = days as i64;
    loop {
        let leap = (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
        let days_in_year = if leap { 366 } else { 365 };
        if remaining_days < days_in_year {
            break;
        }
        remaining_days -= days_in_year;
        year += 1;
    }
    let mut month = 1;
    let leap = (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
    let days_in_months = [
        31,
        if leap { 29 } else { 28 },
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31,
    ];
    for &dim in &days_in_months {
        if remaining_days < dim {
            break;
        }
        remaining_days -= dim;
        month += 1;
    }
    let day = remaining_days + 1;
    Some(format!(
        "{:04}-{:02}-{:02} {:02}:{:02}:{:02}",
        year, month, day, hours, minutes, seconds
    ))
}

pub fn compute_ghost_dates(path: &std::path::Path) -> (Option<String>, Option<String>) {
    let mut install_date = None;
    if let Ok(meta) = std::fs::metadata(path) {
        let created = meta.created().ok().and_then(format_system_time);
        let modified = meta.modified().ok().and_then(format_system_time);
        install_date = created.or(modified);
    }

    let dau_path = path.join("updates2.dau");
    let master_dir = path.join("ghost").join("master");
    let master_desc_path = master_dir.join("descript.txt");

    let mut script_update_time = None;
    for desc_p in [path.join("descript.txt"), master_desc_path.clone()] {
        if desc_p.is_file()
            && let Ok(content) = std::fs::read_to_string(&desc_p)
        {
            for line in content.lines() {
                let trimmed = line.trim();
                if let Some((k, v)) = trimmed.split_once(',') {
                    let key = k.trim().to_lowercase();
                    if key == "update.lasttime" || key == "history.update.lasttime" {
                        let val = v.trim();
                        if !val.is_empty() {
                            if let Ok(ts) = val.parse::<u64>()
                                && ts > 86400 * 365
                            {
                                let st = std::time::UNIX_EPOCH + std::time::Duration::from_secs(ts);
                                script_update_time = format_system_time(st);
                            } else if val.len() >= 8 && !val.starts_with("1970") {
                                script_update_time = Some(val.to_string());
                            }
                        }
                    }
                }
            }
        }
    }

    let mut latest_mtime: Option<std::time::SystemTime> = None;
    let mut consider = |p: &std::path::Path| {
        if let Ok(meta) = std::fs::metadata(p)
            && let Ok(mtime) = meta.modified()
        {
            latest_mtime = Some(match latest_mtime {
                Some(prev) if prev > mtime => prev,
                _ => mtime,
            });
        }
    };

    consider(&dau_path);
    consider(&master_desc_path);
    consider(&path.join("descript.txt"));
    consider(&path.join("install.txt"));

    if let Ok(entries) = std::fs::read_dir(&master_dir) {
        for entry in entries.flatten() {
            let entry_path = entry.path();
            if entry_path.is_file() {
                let fname = entry.file_name().to_string_lossy().to_ascii_lowercase();
                let is_runtime_save = fname.ends_with("_variable.cfg")
                    || fname.ends_with("savedata.txt")
                    || fname.ends_with("savedata.dat")
                    || fname.ends_with(".sav")
                    || fname.ends_with(".log")
                    || fname.ends_with(".bak")
                    || fname.ends_with(".tmp")
                    || fname == "profile";
                if !is_runtime_save {
                    consider(&entry_path);
                }
            }
        }
    }

    let update_date = script_update_time
        .or_else(|| latest_mtime.and_then(format_system_time))
        .or_else(|| install_date.clone());

    (install_date, update_date)
}
