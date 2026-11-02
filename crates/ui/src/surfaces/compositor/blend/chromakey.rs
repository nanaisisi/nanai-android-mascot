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
}
