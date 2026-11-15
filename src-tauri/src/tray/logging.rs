//! トレイ用ログ出力ヘルパー

use std::fs::OpenOptions;
use std::io::Write;

pub fn log_tray(msg: &str) {
    std::println!("{}", msg);
    if let Ok(mut f) = OpenOptions::new()
        .create(true)
        .append(true)
        .open("nanai_tray_debug.log")
    {
        let _ = writeln!(f, "[{}] {}", chrono::Local::now().format("%H:%M:%S"), msg);
    }
}
