//! Specta TypeScript 型定義バインディング自動生成処理

#[cfg(all(debug_assertions, not(target_os = "android")))]
use specta_typescript::Typescript;
#[cfg(all(debug_assertions, not(target_os = "android")))]
use tauri_specta::{Builder as SpectaBuilder, collect_commands};

pub fn export_typescript_bindings() {
    #[cfg(all(debug_assertions, not(target_os = "android")))]
    {
        let specta_builder = SpectaBuilder::<tauri::Wry>::new().commands(collect_commands![
            crate::commands::window::test_command,
            crate::commands::shiori_events::on_mouse_click,
            crate::commands::shiori_events::on_second_change,
            crate::commands::shiori_status::get_shiori_status,
            crate::commands::android::request_overlay_permission,
            crate::commands::android::setup_foreground_service,
            crate::commands::android::set_overlay_transparency,
            crate::commands::android::set_click_through,
            crate::commands::android::resize_overlay_window,
            crate::commands::android::trim_memory_command,
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
