//! 設定系ブラケットコマンド（set, bind, open, lock/unlock 等）ハンドラー定義モジュール

use crate::script::command::SakuraCommand;

pub(crate) fn handle_setting_command(
    parts: &[String],
    callback: &mut dyn FnMut(SakuraCommand),
) -> bool {
    match parts[0].as_str() {
        "enter" | "leave" => handle_enter_leave(parts, callback),
        "bind" => handle_bind(parts, callback),
        "open" => handle_open(parts, callback),
        "set" => handle_set(parts, callback),
        "lock" | "unlock" => handle_lock_unlock(parts, callback),
        "*" => handle_marker(callback),
        "change" => handle_change(parts, callback),
        "call" => handle_call(parts, callback),
        _ => return false,
    }
    true
}

pub(super) fn handle_enter_leave(parts: &[String], callback: &mut dyn FnMut(SakuraCommand)) {
    let mode = parts.get(1).cloned().unwrap_or_default();
    callback(SakuraCommand::ModeChange {
        mode,
        active: parts[0] == "enter",
    });
}

pub(super) fn handle_bind(parts: &[String], callback: &mut dyn FnMut(SakuraCommand)) {
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

pub(super) fn handle_open(parts: &[String], callback: &mut dyn FnMut(SakuraCommand)) {
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

pub(super) fn handle_set(parts: &[String], callback: &mut dyn FnMut(SakuraCommand)) {
    let setting = parts.get(1).cloned().unwrap_or_default();
    match setting.to_lowercase().as_str() {
        "quicksection" => {
            let enabled = parts
                .get(2)
                .map(|v| !matches!(v.as_str(), "0" | "false"))
                .unwrap_or(true);
            callback(SakuraCommand::Quick(enabled));
        }
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
        "alignmenttodesktop" | "alignmentondesktop" => {
            callback(SakuraCommand::Command {
                args: parts.to_vec(),
            });
        }
        _ => {
            callback(SakuraCommand::Command {
                args: parts.to_vec(),
            });
        }
    }
}

pub(super) fn handle_lock_unlock(parts: &[String], callback: &mut dyn FnMut(SakuraCommand)) {
    let target = parts.get(1).map(|s| s.as_str()).unwrap_or("");
    if target == "balloonmove" {
        callback(SakuraCommand::LockBalloonMove(parts[0] == "lock"));
    } else if target == "balloonrepaint" {
        callback(SakuraCommand::LockBalloonRepaint(parts[0] == "lock"));
    } else {
        callback(SakuraCommand::Command {
            args: parts.to_vec(),
        });
    }
}

pub(super) fn handle_marker(callback: &mut dyn FnMut(SakuraCommand)) {
    callback(SakuraCommand::Marker);
}

pub(super) fn handle_change(parts: &[String], callback: &mut dyn FnMut(SakuraCommand)) {
    let target = parts.get(1).cloned().unwrap_or_default();
    let name = parts.get(2).cloned().unwrap_or_default();
    callback(SakuraCommand::Change { target, name });
}

pub(super) fn handle_call(parts: &[String], callback: &mut dyn FnMut(SakuraCommand)) {
    let target = parts.get(1).cloned().unwrap_or_default();
    let name = parts.get(2).cloned().unwrap_or_default();
    callback(SakuraCommand::Call { target, name });
}
