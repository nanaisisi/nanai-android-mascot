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
}
