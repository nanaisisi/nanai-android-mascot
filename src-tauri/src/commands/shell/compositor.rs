use nanai_surface::SurfaceFrameBuffer;

#[tauri::command]
pub fn create_surface_frame_buffer(width: u32, height: u32) -> Result<SurfaceFrameBuffer, String> {
    Ok(SurfaceFrameBuffer::new(width, height))
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ClearFrameBufferRectParams {
    fb: SurfaceFrameBuffer,
    x: u32,
    y: u32,
    w: u32,
    h: u32,
}

impl ClearFrameBufferRectParams {
    // Add getter methods
    pub fn fb(&self) -> &SurfaceFrameBuffer {
        &self.fb
    }

    pub fn x(&self) -> u32 {
        self.x
    }

    pub fn y(&self) -> u32 {
        self.y
    }

    pub fn w(&self) -> u32 {
        self.w
    }

    pub fn h(&self) -> u32 {
        self.h
    }
}

#[tauri::command]
pub fn clear_frame_buffer_rect(
    params: ClearFrameBufferRectParams,
) -> Result<SurfaceFrameBuffer, String> {
    let mut fb = params.fb().clone();
    fb.clear_rect(params.x(), params.y(), params.w(), params.h());
    Ok(fb)
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ApplyChromakeyToBufferParams {
    fb: SurfaceFrameBuffer,
    r: u8,
    g: u8,
    b: u8,
}

impl ApplyChromakeyToBufferParams {
    // Add getter methods
    pub fn fb(&self) -> &SurfaceFrameBuffer {
        &self.fb
    }

    pub fn r(&self) -> u8 {
        self.r
    }

    pub fn g(&self) -> u8 {
        self.g
    }

    pub fn b(&self) -> u8 {
        self.b
    }
}

#[tauri::command]
pub fn apply_chromakey_to_buffer(
    params: ApplyChromakeyToBufferParams,
) -> Result<SurfaceFrameBuffer, String> {
    let mut fb = params.fb().clone();
    fb.apply_chromakey(params.r(), params.g(), params.b());
    Ok(fb)
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ApplyCornerChromakeyToBufferParams {
    fb: SurfaceFrameBuffer,
}

impl ApplyCornerChromakeyToBufferParams {
    // Add getter methods
    pub fn fb(&self) -> &SurfaceFrameBuffer {
        &self.fb
    }
}

#[tauri::command]
pub fn apply_corner_chromakey_to_buffer(
    params: ApplyCornerChromakeyToBufferParams,
) -> Result<SurfaceFrameBuffer, String> {
    let mut fb = params.fb().clone();
    fb.apply_corner_chromakey();
    Ok(fb)
}
