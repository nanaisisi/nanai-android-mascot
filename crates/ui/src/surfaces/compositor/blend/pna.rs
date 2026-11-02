//! PNA アルファマスク処理

use crate::surfaces::compositor::framebuffer::SurfaceFrameBuffer;

impl SurfaceFrameBuffer {
    /// PNA アルファマスク（8bit グレースケールマスク: 幅*高さバイト）を適用する
    pub fn apply_pna_mask(&mut self, mask_data: &[u8]) -> Result<(), String> {
        let pixel_count = (self.width as usize) * (self.height as usize);
        if mask_data.len() < pixel_count {
            return Err(format!(
                "PNA mask data too short: expected at least {}, got {}",
                pixel_count,
                mask_data.len()
            ));
        }

        for i in 0..pixel_count {
            // PNAの輝度値をアルファチャンネル（4番目のバイト）に代入
            self.data[i * 4 + 3] = mask_data[i];
        }
        Ok(())
    }
}
