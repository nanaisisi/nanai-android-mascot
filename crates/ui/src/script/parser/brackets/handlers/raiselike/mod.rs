use super::super::super::SakuraCommand;
use super::super::utils::{CharsIter, read_bracketed, split_bracket_args};

mod events;
mod execution;
mod settings;

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
            events::handle_raise(&parts, callback);
        }
        "raiseplugin" | "notifyplugin" | "timerraiseplugin" | "timernotifyplugin" => {
            events::handle_plugin_event(&parts, callback);
        }
        "execute" => {
            execution::handle_execute(&parts, callback);
        }
        "enter" | "leave" => {
            settings::handle_enter_leave(&parts, callback);
        }
        "bind" => {
            settings::handle_bind(&parts, callback);
        }
        "open" => {
            settings::handle_open(&parts, callback);
        }
        "set" => {
            settings::handle_set(&parts, callback);
        }
        "lock" | "unlock" => {
            settings::handle_lock_unlock(&parts, callback);
        }
        "*" => {
            settings::handle_marker(callback);
        }
        "biff" => {
            execution::handle_biff(callback);
        }
        "executesntp" => {
            execution::handle_executesntp(callback);
        }
        "create" => {
            execution::handle_create(&parts, callback);
        }
        "change" => {
            settings::handle_change(&parts, callback);
        }
        "call" => {
            settings::handle_call(&parts, callback);
        }
        "save" => {
            execution::handle_save(&parts, callback);
        }
        "restore" => {
            execution::handle_restore(&parts, callback);
        }
        "cancel" => {
            execution::handle_cancel(&parts, callback);
        }
        "close" => {
            execution::handle_close(&parts, callback);
        }
        _ => {
            callback(SakuraCommand::Command { args: parts });
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_handle_raiselike_edge_cases() {
        let mut commands = Vec::new();
        let mut cb = |cmd| commands.push(cmd);

        let mut chars = "no_bracket".chars().peekable();
        handle_raiselike(&mut chars, &mut cb);

        let mut chars = "[]".chars().peekable();
        handle_raiselike(&mut chars, &mut cb);

        let mut chars = "[unknown_cmd, arg1, arg2]".chars().peekable();
        handle_raiselike(&mut chars, &mut cb);

        assert!(!commands.is_empty());
    }
}
