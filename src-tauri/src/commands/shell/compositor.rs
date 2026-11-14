use nanai_surface::SurfaceFrameBuffer;

#[tauri::command]
pub fn create_surface_frame_buffer(width: u32, height: u32) -> Result<SurfaceFrameBuffer, String> {
    Ok(SurfaceFrameBuffer::new(width, height))
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ClearFrameBufferRectParams {
    pub fb: SurfaceFrameBuffer,
    pub x: u32,
    pub y: u32,
    pub w: u32,
    pub h: u32,
}

#[tauri::command]
pub fn clear_frame_buffer_rect(
    params: ClearFrameBufferRectParams,
) -> Result<SurfaceFrameBuffer, String> {
    let ClearFrameBufferRectParams { mut fb, x, y, w, h } = params;
    fb.clear_rect(x, y, w, h);
    Ok(fb)
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ApplyChromakeyToBufferParams {
    pub fb: SurfaceFrameBuffer,
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

#[tauri::command]
pub fn apply_chromakey_to_buffer(
    params: ApplyChromakeyToBufferParams,
) -> Result<SurfaceFrameBuffer, String> {
    let ApplyChromakeyToBufferParams { mut fb, r, g, b } = params;
    fb.apply_chromakey(r, g, b);
    Ok(fb)
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ApplyCornerChromakeyToBufferParams {
    pub fb: SurfaceFrameBuffer,
}

#[tauri::command]
pub fn apply_corner_chromakey_to_buffer(
    params: ApplyCornerChromakeyToBufferParams,
) -> Result<SurfaceFrameBuffer, String> {
    let mut fb = params.fb;
    fb.apply_corner_chromakey();
    Ok(fb)
}
