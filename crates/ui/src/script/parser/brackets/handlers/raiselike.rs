use super::super::super::SakuraCommand;
use super::super::utils::{read_bracketed, CharsIter};

pub(crate) fn handle_raiselike(chars: &mut CharsIter<'_>, callback: &mut dyn FnMut(SakuraCommand)) {
    let Some(cmd_str) = read_bracketed(chars) else {
        return;
    };
    let parts: Vec<&str> = cmd_str.split(',').map(|s| s.trim()).collect();
    match parts[0] {
        "raise" => {
            let event = parts.get(1).unwrap_or(&"").to_string();
            let refs = if parts.len() > 2 {
                parts[2..].iter().map(|s| s.to_string()).collect()
            } else {
                Vec::new()
            };
            callback(SakuraCommand::Raise {
                event,
                references: refs,
            });
        }
        "execute" => {
            if parts.get(1).is_some_and(|p| *p == "schedule-add") {
                let date = parts.get(2).unwrap_or(&"Today").to_string();
                let time = parts.get(3).unwrap_or(&"12:00").to_string();
                let title = parts.get(4).unwrap_or(&"スケジュール").to_string();
                let memo = parts.get(5).unwrap_or(&"").to_string();
                callback(SakuraCommand::ScheduleAdd {
                    date,
                    time,
                    title,
                    memo,
                });
            } else if parts.get(1).is_some_and(|p| *p == "extractarchive" || *p == "compressarchive" || *p == "createnar") {
                let action = parts.get(1).unwrap_or(&"").to_string();
                let filename = parts.get(2).unwrap_or(&"").to_string();
                let dest = parts.get(3).unwrap_or(&"").to_string();
                callback(SakuraCommand::ArchiveExec { action, filename, dest });
            } else if parts.get(1).is_some_and(|p| *p == "download" || *p == "http-get") {
                let url = parts.get(2).unwrap_or(&"").to_string();
                let save_path = parts.get(3).unwrap_or(&"").to_string();
                callback(SakuraCommand::DownloadExec { url, save_path });
            } else if parts.get(1).is_some_and(|p| *p == "upload" || *p == "http-post") {
                let url = parts.get(2).unwrap_or(&"").to_string();
                let file_path = parts.get(3).unwrap_or(&"").to_string();
                callback(SakuraCommand::UploadExec { url, file_path });
            } else if parts.get(1).is_some_and(|p| *p == "mailcheck") {
                let account = parts.get(2).unwrap_or(&"").to_string();
                callback(SakuraCommand::MailCheckExec { account });
            } else if parts.get(1).is_some_and(|p| *p == "mailsend" || *p == "mailsettings") {
                let action = parts.get(1).unwrap_or(&"").to_string();
                let target = parts.get(2).unwrap_or(&"").to_string();
                callback(SakuraCommand::MailExec { action, target });
            } else {
                callback(SakuraCommand::Command {
                    args: parts.iter().map(|s| s.to_string()).collect(),
                });
            }
        }
        "bind" => {
            let category = parts.get(1).unwrap_or(&"").to_string();
            let part = parts.get(2).unwrap_or(&"").to_string();
            let status = parts.get(3).and_then(|v| match *v {
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
            let dialog_type = parts.get(1).unwrap_or(&"").to_string();
            let id = parts.get(2).unwrap_or(&"").to_string();
            let args = if parts.len() > 3 {
                parts[3..].iter().map(|s| s.to_string()).collect()
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
            let setting = parts.get(1).unwrap_or(&"").to_string();
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
                    let state = parts.get(2).unwrap_or(&"").to_string();
                    callback(SakuraCommand::WindowState(state));
                }
                "wallpaper" => {
                    let filename = parts.get(2).unwrap_or(&"").to_string();
                    let option = parts.get(3).unwrap_or(&"").to_string();
                    callback(SakuraCommand::SetWallpaper { filename, option });
                }
                "httptimeout" => {
                    let timeout = parts.get(2).and_then(|s| s.parse().ok()).unwrap_or(0);
                    callback(SakuraCommand::SetHttpTimeout(timeout));
                }
                "proxy" => {
                    let server = parts.get(2).unwrap_or(&"").to_string();
                    let port = parts.get(3).and_then(|s| s.parse().ok()).unwrap_or(80);
                    callback(SakuraCommand::SetProxy { server, port });
                }
                _ => {
                    callback(SakuraCommand::Command {
                        args: parts.iter().map(|s| s.to_string()).collect(),
                    });
                }
            }
        }
        "lock" => {
            if parts.get(1).is_some_and(|p| *p == "balloonmove") {
                callback(SakuraCommand::LockBalloonMove(true));
            } else {
                callback(SakuraCommand::Command {
                    args: parts.iter().map(|s| s.to_string()).collect(),
                });
            }
        }
        "unlock" => {
            if parts.get(1).is_some_and(|p| *p == "balloonmove") {
                callback(SakuraCommand::LockBalloonMove(false));
            } else {
                callback(SakuraCommand::Command {
                    args: parts.iter().map(|s| s.to_string()).collect(),
                });
            }
        }
        "biff" => {
            callback(SakuraCommand::Biff);
        }
        "executesntp" => {
            callback(SakuraCommand::ExecuteSntp);
        }
        "create" => {
            if parts.get(1).is_some_and(|p| *p == "shortcut") {
                callback(SakuraCommand::CreateShortcut);
            } else {
                callback(SakuraCommand::Command {
                    args: parts.iter().map(|s| s.to_string()).collect(),
                });
            }
        }
        "change" => {
            let target = parts.get(1).unwrap_or(&"").to_string();
            let name = parts.get(2).unwrap_or(&"").to_string();
            callback(SakuraCommand::Change { target, name });
        }
        "call" => {
            let target = parts.get(1).unwrap_or(&"").to_string();
            let name = parts.get(2).unwrap_or(&"").to_string();
            callback(SakuraCommand::Call { target, name });
        }
        "save" => {
            if parts.get(1).is_some_and(|p| *p == "wallpaper") {
                callback(SakuraCommand::SaveWallpaper);
            } else {
                callback(SakuraCommand::Command {
                    args: parts.iter().map(|s| s.to_string()).collect(),
                });
            }
        }
        "restore" => {
            if parts.get(1).is_some_and(|p| *p == "wallpaper") {
                callback(SakuraCommand::RestoreWallpaper);
            } else {
                callback(SakuraCommand::Command {
                    args: parts.iter().map(|s| s.to_string()).collect(),
                });
            }
        }
        "cancel" => {
            let service = parts.get(1).unwrap_or(&"").to_string();
            let target = parts.get(2).unwrap_or(&"").to_string();
            callback(SakuraCommand::Cancel { service, target });
        }
        "close" => {
            let service = parts.get(1).unwrap_or(&"").to_string();
            let target = parts.get(2).unwrap_or(&"").to_string();
            callback(SakuraCommand::Close { service, target });
        }
        _ => {
            callback(SakuraCommand::Command {
                args: parts.iter().map(|s| s.to_string()).collect(),
            });
        }
    }
}
