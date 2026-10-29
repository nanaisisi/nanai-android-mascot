use std::fmt;
use std::sync::OnceLock;

#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Debug)]
pub enum LogLevel {
    Off,
    Error,
    Warn,
    Info,
    Debug,
    Trace,
}

static LOG_LEVEL: OnceLock<LogLevel> = OnceLock::new();

pub fn initialize_logging_from_args() {
    let level = std::env::args()
        .find_map(|arg| {
            if arg == "--quiet" {
                return Some(LogLevel::Off);
            }
            arg.strip_prefix("--log-level=").and_then(parse_log_level)
        })
        .unwrap_or(LogLevel::Info);
    let _ = LOG_LEVEL.set(level);
}

fn parse_log_level(value: &str) -> Option<LogLevel> {
    match value.to_ascii_lowercase().as_str() {
        "off" | "none" => Some(LogLevel::Off),
        "error" => Some(LogLevel::Error),
        "warn" | "warning" => Some(LogLevel::Warn),
        "info" => Some(LogLevel::Info),
        "debug" => Some(LogLevel::Debug),
        "trace" => Some(LogLevel::Trace),
        _ => None,
    }
}

pub fn log_print(level: LogLevel, message: fmt::Arguments<'_>) {
    let configured = LOG_LEVEL.get().copied().unwrap_or(LogLevel::Info);
    if level <= configured && level != LogLevel::Off {
        std::eprintln!("{message}");
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_log_level() {
        assert_eq!(parse_log_level("off"), Some(LogLevel::Off));
        assert_eq!(parse_log_level("ERROR"), Some(LogLevel::Error));
        assert_eq!(parse_log_level("warning"), Some(LogLevel::Warn));
        assert_eq!(parse_log_level("info"), Some(LogLevel::Info));
        assert_eq!(parse_log_level("debug"), Some(LogLevel::Debug));
        assert_eq!(parse_log_level("trace"), Some(LogLevel::Trace));
        assert_eq!(parse_log_level("invalid"), None);
    }
}
