//! ゴーストディレクトリのスキャン（Tauri コマンド）

pub mod date;
pub mod descript;
pub mod directory;
pub mod shell;

pub use date::compute_ghost_dates;
pub use descript::read_descript_file;
pub use directory::{ScanResult, scan_ghost_directory};
pub use shell::scan_shells_from_ghost;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ghost_scan_reexports() {
        assert!(read_descript_file(std::path::Path::new("nonexistent")).is_none());
    }

    #[test]
    fn test_format_system_time() {
        use std::time::{Duration, UNIX_EPOCH};
        let epoch = UNIX_EPOCH;
        let formatted = date::format_system_time(epoch);
        assert_eq!(formatted, Some("1970-01-01 00:00:00".to_string()));

        let one_day = epoch + Duration::from_secs(86400);
        let formatted_day = date::format_system_time(one_day);
        assert_eq!(formatted_day, Some("1970-01-02 00:00:00".to_string()));
    }
}
