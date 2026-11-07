//! クロマキー処理

use crate::surfaces::compositor::framebuffer::SurfaceFrameBuffer;

impl SurfaceFrameBuffer {
    /// 指定色または (0,0) ピクセル色に合致するピクセルを完全透明 (A=0) にする
    pub fn apply_chromakey(&mut self, target_r: u8, target_g: u8, target_b: u8) {
        let pixel_count = (self.width as usize) * (self.height as usize);
        let (chunks, _remainder) = self.data.as_chunks_mut::<4>();
        for chunk in chunks.iter_mut().take(pixel_count) {
            let r = chunk[0];
            let g = chunk[1];
            let b = chunk[2];

            // 完全一致または純緑（許容差判定: R<=35, G>=220, B<=35）
            let is_match = (r == target_r && g == target_g && b == target_b)
                || (target_r == 0
                    && target_g >= 220
                    && target_b == 0
                    && r <= 35
                    && g >= 220
                    && b <= 35);

            if is_match {
                chunk[3] = 0;
            }
        }
    }

    /// 左上ピクセル (0,0) の色をクロマキー透過色として適用する
    pub fn apply_corner_chromakey(&mut self) {
        if let Some((r, g, b, _)) = self.get_pixel(0, 0) {
            self.apply_chromakey(r, g, b);
        }
    }

    /// `seriko.paint_transparent_region_black`:
    /// 画像透過色（左上ピクセル色）と一致するが、透明度が0（完全透明）ではないピクセル領域を黒(RGB=0,0,0)で塗りつぶす。
    /// 指定された透明度はそのまま保持される。
    pub fn paint_transparent_region_black(&mut self, target_r: u8, target_g: u8, target_b: u8) {
        let pixel_count = (self.width as usize) * (self.height as usize);
        let (chunks, _remainder) = self.data.as_chunks_mut::<4>();
        for chunk in chunks.iter_mut().take(pixel_count) {
            let r = chunk[0];
            let g = chunk[1];
            let b = chunk[2];
            let a = chunk[3];

            if a == 0 {
                continue;
            }

            let is_match = (r == target_r && g == target_g && b == target_b)
                || (target_r == 0
                    && target_g >= 220
                    && target_b == 0
                    && r <= 35
                    && g >= 220
                    && b <= 35);

            if is_match {
                chunk[0] = 0;
                chunk[1] = 0;
                chunk[2] = 0;
            }
        }
    }

    /// 左上ピクセル (0,0) の色を対象に `paint_transparent_region_black` を適用する
    pub fn paint_corner_transparent_region_black(&mut self) {
        if let Some((r, g, b, _)) = self.get_pixel(0, 0) {
            self.paint_transparent_region_black(r, g, b);
        }
    }
}
