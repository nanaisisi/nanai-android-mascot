use super::super::super::super::SakuraCommand;

pub(crate) fn handle_raise(parts: &[String], callback: &mut dyn FnMut(SakuraCommand)) {
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

pub(crate) fn handle_plugin_event(parts: &[String], callback: &mut dyn FnMut(SakuraCommand)) {
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
