//! Specta TypeScript 型定義バインディング自動生成処理

#[cfg(debug_assertions)]
use specta_typescript::Typescript;
#[cfg(debug_assertions)]
use tauri_specta::{Builder as SpectaBuilder, collect_commands};

pub fn export_typescript_bindings() {
    #[cfg(debug_assertions)]
    {
        let specta_builder = SpectaBuilder::<tauri::Wry>::new().commands(collect_commands![
            crate::commands::window::test_command,
            crate::commands::shiori::on_mouse_click,
            crate::commands::shiori::on_second_change,
            crate::commands::shiori::get_shiori_status,
            crate::commands::window::request_overlay_permission,
            crate::commands::window::setup_foreground_service,
            crate::commands::window::set_overlay_transparency,
            crate::commands::window::set_click_through,
            crate::commands::window::resize_overlay_window,
            crate::commands::window::trim_memory_command,
        ]);

        specta_builder
            .export(Typescript::default(), "../ui/bindings.ts")
            .expect("Failed to export TypeScript bindings");

        if let Ok(content) = std::fs::read_to_string("../ui/bindings.ts") {
            let patched = content
                .replace("error: e  as any", "error: e as E")
                .replace("error: e as any", "error: e as E");
            let _ = std::fs::write("../ui/bindings.ts", patched);
        }
    }
}
