//! サーフィス画像コンポジタ - ブレンド、クロマキー処理、レイヤー合成拡張

use super::super::types::DrawMethod;
use super::framebuffer::SurfaceFrameBuffer;

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

    /// 指定色または (0,0) ピクセル色に合致するピクセルを完全透明 (A=0) にする
    pub fn apply_chromakey(&mut self, target_r: u8, target_g: u8, target_b: u8) {
        let pixel_count = (self.width as usize) * (self.height as usize);
        let chunks = self.data.chunks_exact_mut(4);
        for chunk in chunks.take(pixel_count) {
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

    /// 別のフレームバッファをレイヤーとして指定座標 (dx, dy) に合成する
    pub fn composite_layer(
        &mut self,
        layer: &SurfaceFrameBuffer,
        dx: i32,
        dy: i32,
        method: &DrawMethod,
    ) {
        for ly in 0..layer.height {
            let ty = dy + ly as i32;
            if ty < 0 || ty >= self.height as i32 {
                continue;
            }
            for lx in 0..layer.width {
                let tx = dx + lx as i32;
                if tx < 0 || tx >= self.width as i32 {
                    continue;
                }

                let (sr, sg, sb, sa) = layer.get_pixel(lx, ly).unwrap();
                let dst_idx = ((ty as usize) * (self.width as usize) + (tx as usize)) * 4;

                match method {
                    DrawMethod::Replace | DrawMethod::OverlayFast => {
                        // 対象領域を完全に上書き
                        self.data[dst_idx] = sr;
                        self.data[dst_idx + 1] = sg;
                        self.data[dst_idx + 2] = sb;
                        self.data[dst_idx + 3] = sa;
                    }
                    DrawMethod::AsIs => {
                        // アルファブレンドせずそのまま上書き
                        self.data[dst_idx] = sr;
                        self.data[dst_idx + 1] = sg;
                        self.data[dst_idx + 2] = sb;
                        self.data[dst_idx + 3] = sa;
                    }
                    DrawMethod::Interpolate => {
                        // 下の絵と同一色の部分を透過して重ねる (UKADOC準拠)
                        let dr = self.data[dst_idx];
                        let dg = self.data[dst_idx + 1];
                        let db = self.data[dst_idx + 2];
                        let da = self.data[dst_idx + 3];

                        if sa == 0 || (sr == dr && sg == dg && sb == db) {
                            continue;
                        }

                        let alpha = sa as f32 / 255.0;
                        let inv_alpha = 1.0 - alpha;
                        self.data[dst_idx] = (sr as f32 * alpha + dr as f32 * inv_alpha) as u8;
                        self.data[dst_idx + 1] = (sg as f32 * alpha + dg as f32 * inv_alpha) as u8;
                        self.data[dst_idx + 2] = (sb as f32 * alpha + db as f32 * inv_alpha) as u8;
                        self.data[dst_idx + 3] =
                            (sa as f32 + da as f32 * inv_alpha).min(255.0) as u8;
                    }
                    DrawMethod::Reduce => {
                        // reduce: ベースレイヤと新規レイヤの不透明度（アルファ）を乗算 (UKADOC準拠)
                        // RGB値はベースレイヤのまま保持し、アルファのみ乗算更新
                        let da = self.data[dst_idx + 3];
                        let out_a = ((da as u16 * sa as u16 + 127) / 255) as u8;
                        self.data[dst_idx + 3] = out_a;
                    }
                    DrawMethod::Add => {
                        // Add 加算合成
                        let dr = self.data[dst_idx];
                        let dg = self.data[dst_idx + 1];
                        let db = self.data[dst_idx + 2];
                        let da = self.data[dst_idx + 3];

                        if sa == 0 {
                            continue;
                        }

                        let br = (sr as u16 + dr as u16).min(255) as u8;
                        let bg = (sg as u16 + dg as u16).min(255) as u8;
                        let bb = (sb as u16 + db as u16).min(255) as u8;

                        let alpha = sa as f32 / 255.0;
                        let inv_alpha = 1.0 - alpha;
                        self.data[dst_idx] = (br as f32 * alpha + dr as f32 * inv_alpha) as u8;
                        self.data[dst_idx + 1] = (bg as f32 * alpha + dg as f32 * inv_alpha) as u8;
                        self.data[dst_idx + 2] = (bb as f32 * alpha + db as f32 * inv_alpha) as u8;
                        self.data[dst_idx + 3] =
                            (sa as f32 + da as f32 * inv_alpha).min(255.0) as u8;
                    }
                    DrawMethod::Blend(blend_type) => {
                        // ブレンドモード合成
                        let dr = self.data[dst_idx];
                        let dg = self.data[dst_idx + 1];
                        let db = self.data[dst_idx + 2];
                        let da = self.data[dst_idx + 3];

                        if sa == 0 {
                            continue;
                        }

                        let b_lower = blend_type.to_lowercase();
                        let is_fast = b_lower.ends_with("-fast");
                        let mode = b_lower.trim_end_matches("-fast");

                        let (br, bg, bb) = match mode {
                            "multiply" => (
                                ((sr as u16 * dr as u16) / 255) as u8,
                                ((sg as u16 * dg as u16) / 255) as u8,
                                ((sb as u16 * db as u16) / 255) as u8,
                            ),
                            "screen" => (
                                (255 - ((255 - sr as u16) * (255 - dr as u16) / 255)) as u8,
                                (255 - ((255 - sg as u16) * (255 - dg as u16) / 255)) as u8,
                                (255 - ((255 - sb as u16) * (255 - db as u16) / 255)) as u8,
                            ),
                            "add" | "lighter" => (
                                (sr as u16 + dr as u16).min(255) as u8,
                                (sg as u16 + dg as u16).min(255) as u8,
                                (sb as u16 + db as u16).min(255) as u8,
                            ),
                            "darken" => (sr.min(dr), sg.min(dg), sb.min(db)),
                            "lighten" => (sr.max(dr), sg.max(dg), sb.max(db)),
                            "difference" => (
                                (sr as i16 - dr as i16).unsigned_abs() as u8,
                                (sg as i16 - dg as i16).unsigned_abs() as u8,
                                (sb as i16 - db as i16).unsigned_abs() as u8,
                            ),
                            "exclusion" => (
                                (dr as i32 + sr as i32 - 2 * (dr as i32 * sr as i32) / 255)
                                    .clamp(0, 255) as u8,
                                (dg as i32 + sg as i32 - 2 * (dg as i32 * sg as i32) / 255)
                                    .clamp(0, 255) as u8,
                                (db as i32 + sb as i32 - 2 * (db as i32 * sb as i32) / 255)
                                    .clamp(0, 255) as u8,
                            ),
                            _ => (sr, sg, sb),
                        };

                        // 一般アルファ合成（-fast 指定時はダイレクト代入）
                        if is_fast {
                            self.data[dst_idx] = br;
                            self.data[dst_idx + 1] = bg;
                            self.data[dst_idx + 2] = bb;
                            self.data[dst_idx + 3] = sa;
                        } else {
                            let alpha = sa as f32 / 255.0;
                            let inv_alpha = 1.0 - alpha;
                            self.data[dst_idx] = (br as f32 * alpha + dr as f32 * inv_alpha) as u8;
                            self.data[dst_idx + 1] =
                                (bg as f32 * alpha + dg as f32 * inv_alpha) as u8;
                            self.data[dst_idx + 2] =
                                (bb as f32 * alpha + db as f32 * inv_alpha) as u8;
                            self.data[dst_idx + 3] =
                                (sa as f32 + da as f32 * inv_alpha).min(255.0) as u8;
                        }
                    }
                    _ => {
                        // 通常の Overlay / Base (標準Porter-Duffアルファ合成)
                        if sa == 0 {
                            continue;
                        }
                        if sa == 255 {
                            self.data[dst_idx] = sr;
                            self.data[dst_idx + 1] = sg;
                            self.data[dst_idx + 2] = sb;
                            self.data[dst_idx + 3] = sa;
                        } else {
                            let dr = self.data[dst_idx];
                            let dg = self.data[dst_idx + 1];
                            let db = self.data[dst_idx + 2];
                            let da = self.data[dst_idx + 3];

                            let alpha = sa as f32 / 255.0;
                            let inv_alpha = 1.0 - alpha;

                            self.data[dst_idx] = (sr as f32 * alpha + dr as f32 * inv_alpha) as u8;
                            self.data[dst_idx + 1] =
                                (sg as f32 * alpha + dg as f32 * inv_alpha) as u8;
                            self.data[dst_idx + 2] =
                                (sb as f32 * alpha + db as f32 * inv_alpha) as u8;
                            self.data[dst_idx + 3] =
                                (sa as f32 + da as f32 * inv_alpha).min(255.0) as u8;
                        }
                    }
                }
            }
        }
    }
}
