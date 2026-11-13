//! 32-bit RGBA ピクセル・フレームバッファ処理 & クロマキー・アルファマスク合成エンジン (UKADOC/SSP 準拠)

use wasm_bindgen::prelude::*;

/// 32-bit RGBA フレームバッファ
#[wasm_bindgen]
pub struct SurfaceFrameBuffer {
    width: u32,
    height: u32,
    data: Vec<u8>,
}

#[wasm_bindgen]
impl SurfaceFrameBuffer {
    #[wasm_bindgen(constructor)]
    pub fn new(width: u32, height: u32) -> Self {
        let size = (width * height * 4) as usize;
        Self {
            width,
            height,
            data: vec![0; size],
        }
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

    /// 左上ピクセルカラーまたは指定RGBカラーによるクロマキー（緑・指定色）透過処理
    pub fn apply_chromakey(&mut self, target_r: u8, target_g: u8, target_b: u8) {
        let len = self.data.len();
        let mut i = 0;
        while i < len {
            let r = self.data[i];
            let g = self.data[i + 1];
            let b = self.data[i + 2];
            if r == target_r && g == target_g && b == target_b {
                self.data[i + 3] = 0; // Alpha = 0 (透明)
            }
            i += 4;
        }
    }

    /// 左上コーナーピクセルの色を自動取得してクロマキー透過を適用
    pub fn apply_corner_chromakey(&mut self) {
        if self.data.len() < 4 {
            return;
        }
        let cr = self.data[0];
        let cg = self.data[1];
        let cb = self.data[2];
        self.apply_chromakey(cr, cg, cb);
    }

    /// PNA アルファチャネルマスク画像の合成 (アルファブレンド)
    pub fn apply_pna_alpha_mask(&mut self, pna_data: &[u8]) {
        let len = self.data.len().min(pna_data.len());
        let mut i = 0;
        while i < len {
            // PNA の輝度/R成分をアルファ値として適用
            let alpha = pna_data[i];
            self.data[i + 3] = alpha;
            i += 4;
        }
    }

    /// レイヤーの矩形クリア処理
    pub fn clear_rect(&mut self, x: u32, y: u32, w: u32, h: u32) {
        let max_x = (x + w).min(self.width);
        let max_y = (y + h).min(self.height);

        for cy in y..max_y {
            for cx in x..max_x {
                let idx = ((cy * self.width + cx) * 4) as usize;
                if idx + 3 < self.data.len() {
                    self.data[idx] = 0;
                    self.data[idx + 1] = 0;
                    self.data[idx + 2] = 0;
                    self.data[idx + 3] = 0;
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_chromakey() {
        let mut fb = SurfaceFrameBuffer::new(2, 2);
        fb.data[0] = 0;
        fb.data[1] = 255;
        fb.data[2] = 0;
        fb.data[3] = 255; // (0, 255, 0) 緑

        fb.apply_chromakey(0, 255, 0);
        assert_eq!(fb.data[3], 0);
    }
}
