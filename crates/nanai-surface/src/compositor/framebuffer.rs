//! サーフィス画像コンポジタ - フレームバッファ定義と基本ピクセル操作

use serde::{Deserialize, Serialize};

/// 32bit RGBA ピクセル配列を保持するサーフィスフレームバッファ
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SurfaceFrameBuffer {
    pub width: u32,
    pub height: u32,
    /// RGBA 各チャンネル 8bit の連続バイト列（サイズは width * height * 4）
    pub data: Vec<u8>,
}

impl SurfaceFrameBuffer {
    /// 指定サイズの完全透明なフレームバッファを生成する
    pub fn new(width: u32, height: u32) -> Self {
        let size = (width as usize) * (height as usize) * 4;
        Self {
            width,
            height,
            data: vec![0; size],
        }
    }

    /// RGBA 生バイト列からフレームバッファを生成する
    pub fn from_rgba(width: u32, height: u32, data: Vec<u8>) -> Result<Self, String> {
        let expected_size = (width as usize) * (height as usize) * 4;
        if data.len() != expected_size {
            return Err(format!(
                "Invalid data size: expected {}, got {}",
                expected_size,
                data.len()
            ));
        }
        Ok(Self {
            width,
            height,
            data,
        })
    }

    pub fn width(&self) -> u32 {
        self.width
    }

    pub fn height(&self) -> u32 {
        self.height
    }

    pub fn raw_pixels(&self) -> Vec<u8> {
        self.data.clone()
    }

    /// 指定座標 (x, y) のピクセル色 (r, g, b, a) を取得する
    pub fn get_pixel(&self, x: u32, y: u32) -> Option<(u8, u8, u8, u8)> {
        if x >= self.width || y >= self.height {
            return None;
        }
        let idx = ((y as usize) * (self.width as usize) + (x as usize)) * 4;
        Some((
            self.data[idx],
            self.data[idx + 1],
            self.data[idx + 2],
            self.data[idx + 3],
        ))
    }

    /// 指定座標 (x, y) にピクセル色 (r, g, b, a) を設定する
    pub fn set_pixel(&mut self, x: u32, y: u32, r: u8, g: u8, b: u8, a: u8) {
        if x >= self.width || y >= self.height {
            return;
        }
        let idx = ((y as usize) * (self.width as usize) + (x as usize)) * 4;
        self.data[idx] = r;
        self.data[idx + 1] = g;
        self.data[idx + 2] = b;
        self.data[idx + 3] = a;
    }

    /// バッファ全体を透明クリア (RGBA = 0)
    pub fn clear(&mut self) {
        self.data.fill(0);
    }

    /// 部分矩形領域のみを透明クリア (局所ダーティ領域の更新・描画負荷低減)
    pub fn clear_rect(&mut self, x: u32, y: u32, w: u32, h: u32) {
        if w == 0 || h == 0 || x >= self.width || y >= self.height {
            return;
        }
        let end_x = (x + w).min(self.width);
        let end_y = (y + h).min(self.height);
        let row_bytes = ((end_x - x) as usize) * 4;

        for cy in y..end_y {
            let start_idx = ((cy as usize) * (self.width as usize) + (x as usize)) * 4;
            self.data[start_idx..start_idx + row_bytes].fill(0);
        }
    }

    /// バッファ全体を指定色 (r, g, b, a) で塗りつぶす
    pub fn fill(&mut self, r: u8, g: u8, b: u8, a: u8) {
        let pixel_count = (self.width as usize) * (self.height as usize);
        let (chunks, _remainder) = self.data.as_chunks_mut::<4>();
        for chunk in chunks.iter_mut().take(pixel_count) {
            chunk[0] = r;
            chunk[1] = g;
            chunk[2] = b;
            chunk[3] = a;
        }
    }

    /// 部分矩形領域を指定色 (r, g, b, a) で塗りつぶす
    #[allow(clippy::too_many_arguments)]
    pub fn fill_rect(&mut self, x: u32, y: u32, w: u32, h: u32, r: u8, g: u8, b: u8, a: u8) {
        if w == 0 || h == 0 || x >= self.width || y >= self.height {
            return;
        }
        let end_x = (x + w).min(self.width);
        let end_y = (y + h).min(self.height);

        for cy in y..end_y {
            for cx in x..end_x {
                let idx = ((cy as usize) * (self.width as usize) + (cx as usize)) * 4;
                self.data[idx] = r;
                self.data[idx + 1] = g;
                self.data[idx + 2] = b;
                self.data[idx + 3] = a;
            }
        }
    }

    /// 指定した部分矩形領域を切り出して新しい SurfaceFrameBuffer を作成する
    pub fn copy_rect(&self, x: u32, y: u32, w: u32, h: u32) -> Option<Self> {
        if w == 0 || h == 0 || x >= self.width || y >= self.height {
            return None;
        }
        let actual_w = w.min(self.width - x);
        let actual_h = h.min(self.height - y);

        let mut sub = Self::new(actual_w, actual_h);
        for cy in 0..actual_h {
            let src_y = y + cy;
            let src_start = ((src_y as usize) * (self.width as usize) + (x as usize)) * 4;
            let src_end = src_start + (actual_w as usize) * 4;
            let dst_start = (cy as usize) * (actual_w as usize) * 4;
            let dst_end = dst_start + (actual_w as usize) * 4;
            sub.data[dst_start..dst_end].copy_from_slice(&self.data[src_start..src_end]);
        }
        Some(sub)
    }

    /// 別のバッファを指定座標 (dx, dy) に指定描画メソッドで合成する便利メソッド
    pub fn composite_buffer(
        &mut self,
        src: &SurfaceFrameBuffer,
        dx: i32,
        dy: i32,
        method: &crate::types::DrawMethod,
    ) {
        self.composite_layer(src, dx, dy, method);
    }
}
