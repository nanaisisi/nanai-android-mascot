// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    nanai_android_mascot_lib::run()
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_entry_point_cfg() {
        assert!(true);
    }
}
