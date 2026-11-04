use super::super::super::super::SakuraCommand;

pub(crate) fn handle_execute(parts: &[String], callback: &mut dyn FnMut(SakuraCommand)) {
    if parts.get(1).is_some_and(|p| p == "schedule-add") {
        let date = parts.get(2).cloned().unwrap_or_else(|| "Today".into());
        let time = parts.get(3).cloned().unwrap_or_else(|| "12:00".into());
        let title = parts
            .get(4)
            .cloned()
            .unwrap_or_else(|| "スケジュール".into());
        let memo = parts.get(5).cloned().unwrap_or_default();
        callback(SakuraCommand::ScheduleAdd {
            date,
            time,
            title,
            memo,
        });
    } else if parts.get(1).is_some_and(|p| {
        p == "extractarchive"
            || p == "compressarchive"
            || p == "createnar"
            || p == "createupdatedata"
    }) {
        let action = parts.get(1).cloned().unwrap_or_default();
        let filename = parts.get(2).cloned().unwrap_or_default();
        let dest = parts.get(3).cloned().unwrap_or_default();
        callback(SakuraCommand::ArchiveExec {
            action,
            filename,
            dest,
        });
    } else if parts
        .get(1)
        .is_some_and(|p| p == "download" || p == "http-get")
    {
        let url = parts.get(2).cloned().unwrap_or_default();
        let save_path = parts.get(3).cloned().unwrap_or_default();
        callback(SakuraCommand::DownloadExec { url, save_path });
    } else if parts
        .get(1)
        .is_some_and(|p| p == "upload" || p == "http-post")
    {
        let url = parts.get(2).cloned().unwrap_or_default();
        let file_path = parts.get(3).cloned().unwrap_or_default();
        callback(SakuraCommand::UploadExec { url, file_path });
    } else if parts.get(1).is_some_and(|p| p == "mailcheck") {
        let account = parts.get(2).cloned().unwrap_or_default();
        callback(SakuraCommand::MailCheckExec { account });
    } else if parts
        .get(1)
        .is_some_and(|p| p == "mailsend" || p == "mailsettings")
    {
        let action = parts.get(1).cloned().unwrap_or_default();
        let target = parts.get(2).cloned().unwrap_or_default();
        callback(SakuraCommand::MailExec { action, target });
    } else if parts.get(1).is_some_and(|p| {
        p == "deletefile" || p == "renamefile" || p == "copyfile" || p == "movefile"
    }) {
        let action = parts.get(1).cloned().unwrap_or_default();
        let path = parts.get(2).cloned().unwrap_or_default();
        let dest = parts.get(3).cloned().unwrap_or_default();
        callback(SakuraCommand::FileExec { action, path, dest });
    } else if parts.get(1).is_some_and(|p| p == "resetballoonpos") {
        callback(SakuraCommand::Command {
            args: vec!["execute".to_string(), "resetballoonpos".to_string()],
        });
    } else {
        callback(SakuraCommand::Command {
            args: parts.to_vec(),
        });
    }
}

pub(crate) fn handle_create(parts: &[String], callback: &mut dyn FnMut(SakuraCommand)) {
    if parts.get(1).is_some_and(|p| p == "shortcut") {
        callback(SakuraCommand::CreateShortcut);
    } else {
        callback(SakuraCommand::Command {
            args: parts.to_vec(),
        });
    }
}

pub(crate) fn handle_save(parts: &[String], callback: &mut dyn FnMut(SakuraCommand)) {
    if parts.get(1).is_some_and(|p| p == "wallpaper") {
        callback(SakuraCommand::SaveWallpaper);
    } else {
        callback(SakuraCommand::Command {
            args: parts.to_vec(),
        });
    }
}

pub(crate) fn handle_restore(parts: &[String], callback: &mut dyn FnMut(SakuraCommand)) {
    if parts.get(1).is_some_and(|p| p == "wallpaper") {
        callback(SakuraCommand::RestoreWallpaper);
    } else {
        callback(SakuraCommand::Command {
            args: parts.to_vec(),
        });
    }
}

pub(crate) fn handle_cancel(parts: &[String], callback: &mut dyn FnMut(SakuraCommand)) {
    let service = parts.get(1).cloned().unwrap_or_default();
    let target = parts.get(2).cloned().unwrap_or_default();
    callback(SakuraCommand::Cancel { service, target });
}

pub(crate) fn handle_close(parts: &[String], callback: &mut dyn FnMut(SakuraCommand)) {
    let service = parts.get(1).cloned().unwrap_or_default();
    let target = parts.get(2).cloned().unwrap_or_default();
    callback(SakuraCommand::Close { service, target });
}

pub(crate) fn handle_biff(callback: &mut dyn FnMut(SakuraCommand)) {
    callback(SakuraCommand::Biff);
}

pub(crate) fn handle_executesntp(callback: &mut dyn FnMut(SakuraCommand)) {
    callback(SakuraCommand::ExecuteSntp);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_execution_handlers() {
        let mut commands = Vec::new();
        let mut cb = |cmd| commands.push(cmd);

        handle_execute(
            &["execute".to_string(), "schedule-add".to_string()],
            &mut cb,
        );
        handle_execute(
            &[
                "execute".to_string(),
                "schedule-add".to_string(),
                "2026-03-30".to_string(),
                "10:00".to_string(),
                "Meeting".to_string(),
                "Note".to_string(),
            ],
            &mut cb,
        );
        handle_execute(
            &[
                "execute".to_string(),
                "extractarchive".to_string(),
                "a.nar".to_string(),
                "dest".to_string(),
            ],
            &mut cb,
        );
        handle_execute(
            &[
                "execute".to_string(),
                "download".to_string(),
                "http://url".to_string(),
                "path".to_string(),
            ],
            &mut cb,
        );
        handle_execute(
            &[
                "execute".to_string(),
                "upload".to_string(),
                "http://url".to_string(),
                "path".to_string(),
            ],
            &mut cb,
        );
        handle_execute(
            &[
                "execute".to_string(),
                "mailcheck".to_string(),
                "default".to_string(),
            ],
            &mut cb,
        );
        handle_execute(
            &[
                "execute".to_string(),
                "mailsend".to_string(),
                "target".to_string(),
            ],
            &mut cb,
        );
        handle_execute(
            &[
                "execute".to_string(),
                "deletefile".to_string(),
                "path".to_string(),
                "dest".to_string(),
            ],
            &mut cb,
        );
        handle_execute(
            &["execute".to_string(), "resetballoonpos".to_string()],
            &mut cb,
        );
        handle_execute(&["execute".to_string(), "unknown".to_string()], &mut cb);

        handle_create(&["create".to_string(), "shortcut".to_string()], &mut cb);
        handle_create(&["create".to_string(), "other".to_string()], &mut cb);

        handle_save(&["save".to_string(), "wallpaper".to_string()], &mut cb);
        handle_save(&["save".to_string(), "other".to_string()], &mut cb);

        handle_restore(&["restore".to_string(), "wallpaper".to_string()], &mut cb);
        handle_restore(&["restore".to_string(), "other".to_string()], &mut cb);

        handle_cancel(
            &[
                "cancel".to_string(),
                "service".to_string(),
                "target".to_string(),
            ],
            &mut cb,
        );
        handle_close(
            &[
                "close".to_string(),
                "service".to_string(),
                "target".to_string(),
            ],
            &mut cb,
        );

        handle_biff(&mut cb);
        handle_executesntp(&mut cb);

        assert!(!commands.is_empty());
    }
}
