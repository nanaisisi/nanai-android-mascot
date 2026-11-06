use nanai_android_mascot_ui::surfaces::SurfaceFrameBuffer;

#[tauri::command]
pub fn create_surface_frame_buffer(width: u32, height: u32) -> Result<SurfaceFrameBuffer, String> {
    Ok(SurfaceFrameBuffer::new(width, height))
}

#[tauri::command]
pub fn clear_frame_buffer_rect(
    mut fb: SurfaceFrameBuffer,
    x: u32,
    y: u32,
    w: u32,
    h: u32,
) -> Result<SurfaceFrameBuffer, String> {
    fb.clear_rect(x, y, w, h);
    Ok(fb)
}

#[tauri::command]
pub fn apply_chromakey_to_buffer(
    mut fb: SurfaceFrameBuffer,
    r: u8,
    g: u8,
    b: u8,
) -> Result<SurfaceFrameBuffer, String> {
    fb.apply_chromakey(r, g, b);
    Ok(fb)
}

#[tauri::command]
pub fn apply_corner_chromakey_to_buffer(
    mut fb: SurfaceFrameBuffer,
) -> Result<SurfaceFrameBuffer, String> {
    fb.apply_corner_chromakey();
    Ok(fb)
}
