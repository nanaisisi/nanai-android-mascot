use nanai_android_mascot_ui::surfaces::SurfaceFrameBuffer;

#[tauri::command]
#[allow(dead_code)]
pub fn create_surface_frame_buffer(width: u32, height: u32) -> Result<SurfaceFrameBuffer, String> {
    Ok(SurfaceFrameBuffer::new(width, height))
}

#[tauri::command]
#[allow(dead_code)]
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
