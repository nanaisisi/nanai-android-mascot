use super::super::super::SakuraCommand;
use super::super::utils::{CharsIter, read_bracketed, split_bracket_args};

pub(crate) fn handle_raiselike(chars: &mut CharsIter<'_>, callback: &mut dyn FnMut(SakuraCommand)) {
    let Some(cmd_str) = read_bracketed(chars) else {
        return;
    };
    let parts = split_bracket_args(&cmd_str);
    if parts.is_empty() {
        return;
    }
    match parts[0].as_str() {
        "raise" => {
            let event = parts.get(1).cloned().unwrap_or_default();
            let refs = if parts.len() > 2 {
                parts[2..].to_vec()
            } else {
                Vec::new()
            };
            callback(SakuraCommand::Raise {
                event,
                references: refs,
            });
        }
        "raiseplugin" | "notifyplugin" | "timerraiseplugin" | "timernotifyplugin" => {
            let is_notify = parts[0] == "notifyplugin" || parts[0] == "timernotifyplugin";
            let (plugin, event, refs) = if parts[0].starts_with("timer") {
                let plugin = parts.get(3).cloned().unwrap_or_default();
                let event = parts.get(4).cloned().unwrap_or_default();
                let refs = if parts.len() > 5 {
                    parts[5..].to_vec()
                } else {
                    Vec::new()
                };
                (plugin, event, refs)
            } else {
                let plugin = parts.get(1).cloned().unwrap_or_default();
                let event = parts.get(2).cloned().unwrap_or_default();
                let refs = if parts.len() > 3 {
                    parts[3..].to_vec()
                } else {
                    Vec::new()
                };
                (plugin, event, refs)
            };
            callback(SakuraCommand::PluginEvent {
                plugin,
                event,
                references: refs,
                is_notify,
            });
        }
        "execute" => {
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
                callback(SakuraCommand::Command { args: parts });
            }
        }
        "enter" | "leave" => {
            let mode = parts.get(1).cloned().unwrap_or_default();
            callback(SakuraCommand::ModeChange {
                mode,
                active: parts[0] == "enter",
            });
        }
        "bind" => {
            let category = parts.get(1).cloned().unwrap_or_default();
            let part = parts.get(2).cloned().unwrap_or_default();
            let status = parts.get(3).and_then(|v| match v.as_str() {
                "1" | "true" => Some(true),
                "0" | "false" => Some(false),
                _ => None,
            });
            callback(SakuraCommand::Bind {
                category,
                part,
                status,
            });
        }
        "open" => {
            let dialog_type = parts.get(1).cloned().unwrap_or_default();
            let id = parts.get(2).cloned().unwrap_or_default();
            let args = if parts.len() > 3 {
                parts[3..].to_vec()
            } else {
                Vec::new()
            };
            callback(SakuraCommand::OpenDialog {
                dialog_type,
                id,
                args,
            });
        }
        "set" => {
            let setting = parts.get(1).cloned().unwrap_or_default();
            match setting.to_lowercase().as_str() {
                "choicetimeout" => {
                    let timeout = parts.get(2).and_then(|s| s.parse().ok()).unwrap_or(0);
                    callback(SakuraCommand::ChoiceTimeout(timeout));
                }
                "balloonoffset" => {
                    let x = parts.get(2).and_then(|s| s.parse().ok()).unwrap_or(0);
                    let y = parts.get(3).and_then(|s| s.parse().ok()).unwrap_or(0);
                    callback(SakuraCommand::BalloonOffset { x, y });
                }
                "balloontimeout" => {
                    let timeout = parts.get(2).and_then(|s| s.parse().ok()).unwrap_or(0);
                    callback(SakuraCommand::BalloonTimeout(timeout));
                }
                "windowstate" => {
                    let state = parts.get(2).cloned().unwrap_or_default();
                    callback(SakuraCommand::WindowState(state));
                }
                "wallpaper" => {
                    let filename = parts.get(2).cloned().unwrap_or_default();
                    let option = parts.get(3).cloned().unwrap_or_default();
                    callback(SakuraCommand::SetWallpaper { filename, option });
                }
                "httptimeout" => {
                    let timeout = parts.get(2).and_then(|s| s.parse().ok()).unwrap_or(0);
                    callback(SakuraCommand::SetHttpTimeout(timeout));
                }
                "proxy" => {
                    let server = parts.get(2).cloned().unwrap_or_default();
                    let port = parts.get(3).and_then(|s| s.parse().ok()).unwrap_or(80);
                    callback(SakuraCommand::SetProxy { server, port });
                }
                "autoscroll" | "balloonalign" | "balloonmarker" | "balloonnum" | "balloonwait"
                | "serikotalk" => {
                    let key = setting;
                    let value = parts.get(2).cloned().unwrap_or_default();
                    let extra = if parts.len() > 3 {
                        parts[3..].to_vec()
                    } else {
                        Vec::new()
                    };
                    callback(SakuraCommand::BalloonSetting { key, value, extra });
                }
                _ => {
                    callback(SakuraCommand::Command { args: parts });
                }
            }
        }
        "lock" | "unlock" => {
            let target = parts.get(1).map(|s| s.as_str()).unwrap_or("");
            if target == "balloonmove" {
                callback(SakuraCommand::LockBalloonMove(parts[0] == "lock"));
            } else if target == "balloonrepaint" {
                callback(SakuraCommand::LockBalloonRepaint(parts[0] == "lock"));
            } else {
                callback(SakuraCommand::Command { args: parts });
            }
        }
        "*" => {
            callback(SakuraCommand::Marker);
        }
        "biff" => {
            callback(SakuraCommand::Biff);
        }
        "executesntp" => {
            callback(SakuraCommand::ExecuteSntp);
        }
        "create" => {
            if parts.get(1).is_some_and(|p| p == "shortcut") {
                callback(SakuraCommand::CreateShortcut);
            } else {
                callback(SakuraCommand::Command { args: parts });
            }
        }
        "change" => {
            let target = parts.get(1).cloned().unwrap_or_default();
            let name = parts.get(2).cloned().unwrap_or_default();
            callback(SakuraCommand::Change { target, name });
        }
        "call" => {
            let target = parts.get(1).cloned().unwrap_or_default();
            let name = parts.get(2).cloned().unwrap_or_default();
            callback(SakuraCommand::Call { target, name });
        }
        "save" => {
            if parts.get(1).is_some_and(|p| p == "wallpaper") {
                callback(SakuraCommand::SaveWallpaper);
            } else {
                callback(SakuraCommand::Command { args: parts });
            }
        }
        "restore" => {
            if parts.get(1).is_some_and(|p| p == "wallpaper") {
                callback(SakuraCommand::RestoreWallpaper);
            } else {
                callback(SakuraCommand::Command { args: parts });
            }
        }
        "cancel" => {
            let service = parts.get(1).cloned().unwrap_or_default();
            let target = parts.get(2).cloned().unwrap_or_default();
            callback(SakuraCommand::Cancel { service, target });
        }
        "close" => {
            let service = parts.get(1).cloned().unwrap_or_default();
            let target = parts.get(2).cloned().unwrap_or_default();
            callback(SakuraCommand::Close { service, target });
        }
        _ => {
            callback(SakuraCommand::Command { args: parts });
        }
    }
}
