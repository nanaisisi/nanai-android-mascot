//! キャラクターサーフィス画像 URL キャッシュコマンド

#[tauri::command]
pub async fn set_surface_image(
    state: tauri::State<'_, crate::common::state::AppState>,
    scope_id: i32,
    image_src: String,
) -> Result<(), String> {
    state.surface_images.lock().insert(scope_id, image_src);
    Ok(())
}

#[tauri::command]
pub async fn get_surface_image(
    state: tauri::State<'_, crate::common::state::AppState>,
    scope_id: i32,
) -> Result<String, String> {
    let images = state.surface_images.lock();
    images
        .get(&scope_id)
        .cloned()
        .ok_or_else(|| format!("Surface image not found for scope {}", scope_id))
}
