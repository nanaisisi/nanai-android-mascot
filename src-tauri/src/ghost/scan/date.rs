pub fn format_system_time(sys_time: std::time::SystemTime) -> Option<String> {
    let dur = sys_time.duration_since(std::time::UNIX_EPOCH).ok()?;
    let secs = dur.as_secs();
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
    let days_in_months = [31, if leap { 29 } else { 28 }, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    for &dim in &days_in_months {
        if remaining_days < dim {
            break;
        }
        remaining_days -= dim;
        month += 1;
    }
    let day = remaining_days + 1;
    Some(format!("{:04}-{:02}-{:02} {:02}:{:02}:{:02}", year, month, day, hours, minutes, seconds))
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
                let fname = entry
                    .file_name()
                    .to_string_lossy()
                    .to_ascii_lowercase();
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

    let update_date = latest_mtime
        .and_then(format_system_time)
        .or_else(|| install_date.clone());

    (install_date, update_date)
}
