#[cfg_attr(not(debug_assertions), allow(unused_imports))]
#[allow(unused_imports)]
use tauri::Manager;

macro_rules! println {
    ($($arg:tt)*) => {
        $crate::common::log_print($crate::common::LogLevel::Info, format_args!($($arg)*));
    };
}

macro_rules! eprintln {
    ($($arg:tt)*) => {
        $crate::common::log_print($crate::common::LogLevel::Warn, format_args!($($arg)*));
    };
}

mod bindings;
mod commands;
mod common;
mod events;
mod fmo;
mod ghost;
mod invoke;
mod jumplist;
mod setup;
mod shiori;
mod sstp;
mod tray;



pub use common::paths::{
    clean_verbatim_path, normalize_path, resolve_asset_path, resolve_ghost_directory,
};

use common::*;

#[allow(non_camel_case_types)]
pub trait Nanai_android_mascot_uiInterface {
    fn run(&self);
}

pub struct NanaiAndroidMascotUiApp;

impl Nanai_android_mascot_uiInterface for NanaiAndroidMascotUiApp {
    fn run(&self) {
        run();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    common::initialize_logging_from_args();

    bindings::export_typescript_bindings();

    let builder = tauri::Builder::default()
        .manage(AppState::new())
        .setup(|app| setup::setup_app(app));

    #[cfg(desktop)]
    let builder = builder.on_menu_event(move |app_handle, event| {
        events::handle_menu_event(app_handle, event);
    });

    builder
        .on_window_event(|window, event| {
            events::handle_window_event(window, event);
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(invoke::get_invoke_handler())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
