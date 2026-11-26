//! Windows アイコン (`.ico`) / カーソル (`.cur`) / アニメーションカーソル (`.ani`) デコーダおよび APNG エンコーダ

use base64::Engine;
use image::{ImageFormat, RgbaImage};
use serde::Serialize;
use specta::Type;
use std::io::Cursor;

/// デコード済み単一フレーム画像（ICO / CUR / ANI 共通）
#[derive(Debug, Clone)]
pub struct DecodedIconImage {
    pub rgba: RgbaImage,
    pub hotspot_x: u16,
    pub hotspot_y: u16,
}

/// デコード済みアニメーションフレーム
#[derive(Debug, Clone)]
pub struct DecodedAniStep {
    pub rgba: RgbaImage,
    pub hotspot_x: u16,
    pub hotspot_y: u16,
    /// 待ち時間（jiffies = 1/60 秒単位）
    pub delay_jiffies: u32,
}

/// フロントエンドへ返却するカーソルフレーム情報
#[derive(Debug, Clone, Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct CursorFrameAsset {
    pub data_url: String,
    pub hotspot_x: u16,
    pub hotspot_y: u16,
    pub duration_ms: u32,
}

/// フロントエンドへ返却するカーソルアセット（静止・アニメ共通）
#[derive(Debug, Clone, Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct CursorAssetData {
    pub frames: Vec<CursorFrameAsset>,
}

/// `.ico` / `.cur` バイト列から最大サイズの画像をデコードする（アルファ透過対応）。
pub fn decode_ico_or_cur_largest(bytes: &[u8]) -> Option<DecodedIconImage> {
    if bytes.len() < 6 {
        return None;
    }
    let reserved = u16::from_le_bytes([bytes[0], bytes[1]]);
    let icon_type = u16::from_le_bytes([bytes[2], bytes[3]]);
    let count = u16::from_le_bytes([bytes[4], bytes[5]]) as usize;
    if reserved != 0 || (icon_type != 1 && icon_type != 2) || count == 0 {
        return None;
    }

    let dir_end = 6usize.checked_add(count.checked_mul(16)?)?;
    if bytes.len() < dir_end {
        return None;
    }

    let is_cur = icon_type == 2;
    let mut best_idx: Option<usize> = None;
    let mut best_score: (u64, u16, u32) = (0, 0, 0);

    for i in 0..count {
        let off = 6 + i * 16;
        let entry = &bytes[off..off + 16];
        let w = if entry[0] == 0 {
            256u64
        } else {
            entry[0] as u64
        };
        let h = if entry[1] == 0 {
            256u64
        } else {
            entry[1] as u64
        };
        let bit_count = if is_cur {
            0
        } else {
            u16::from_le_bytes([entry[6], entry[7]])
        };
        let bytes_in_res = u32::from_le_bytes([entry[8], entry[9], entry[10], entry[11]]);
        let img_offset = u32::from_le_bytes([entry[12], entry[13], entry[14], entry[15]]) as usize;

        if bytes_in_res == 0 {
            continue;
        }
        let Some(img_end) = img_offset.checked_add(bytes_in_res as usize) else {
            continue;
        };
        if img_end > bytes.len() {
            continue;
        }

        let score = (w * h, bit_count, bytes_in_res);
        if best_idx.is_none() || score > best_score {
            best_idx = Some(i);
            best_score = score;
        }
    }

    let idx = best_idx?;
    let entry = &bytes[6 + idx * 16..6 + (idx + 1) * 16];
    let hotspot_x = if is_cur {
        u16::from_le_bytes([entry[4], entry[5]])
    } else {
        0
    };
    let hotspot_y = if is_cur {
        u16::from_le_bytes([entry[6], entry[7]])
    } else {
        0
    };
    let bytes_in_res = u32::from_le_bytes([entry[8], entry[9], entry[10], entry[11]]) as usize;
    let img_offset = u32::from_le_bytes([entry[12], entry[13], entry[14], entry[15]]) as usize;
    let payload = &bytes[img_offset..img_offset + bytes_in_res];

    let rgba = decode_ico_entry_payload(entry, payload)?;
    let max_x = rgba.width().saturating_sub(1).min(u16::MAX as u32) as u16;
    let max_y = rgba.height().saturating_sub(1).min(u16::MAX as u32) as u16;

    Some(DecodedIconImage {
        rgba,
        hotspot_x: hotspot_x.min(max_x),
        hotspot_y: hotspot_y.min(max_y),
    })
}

fn decode_ico_entry_payload(entry: &[u8], payload: &[u8]) -> Option<RgbaImage> {
    const PNG_SIG: &[u8; 8] = b"\x89PNG\r\n\x1a\n";
    if payload.len() >= 8 && &payload[..8] == PNG_SIG {
        return image::load_from_memory_with_format(payload, ImageFormat::Png)
            .ok()
            .map(|img| img.to_rgba8());
    }

    // 単一エントリ ICO (type=1) としてラップし image クレートの ICO デコーダで DIB + AND マスクを復元する
    let mut single_ico = Vec::with_capacity(22 + payload.len());
    single_ico.extend_from_slice(&[0, 0, 1, 0, 1, 0]); // ICONDIR (type=1, count=1)
    single_ico.extend_from_slice(&entry[0..4]); // width, height, colorCount, reserved
    single_ico.extend_from_slice(&[1, 0]); // planes = 1
    // DIB ヘッダの biBitCount (offset 14..16) を参照して bitCount を補完
    if payload.len() >= 16 {
        single_ico.extend_from_slice(&payload[14..16]);
    } else {
        single_ico.extend_from_slice(&[32, 0]);
    }
    single_ico.extend_from_slice(&(payload.len() as u32).to_le_bytes());
    single_ico.extend_from_slice(&22u32.to_le_bytes());
    single_ico.extend_from_slice(payload);

    image::load_from_memory_with_format(&single_ico, ImageFormat::Ico)
        .ok()
        .map(|img| img.to_rgba8())
}

/// `.ani` (RIFF `ACON`) バイト列をデコードし、再生順・待ち時間に従ったステップ列を返す。
pub fn decode_ani_steps(bytes: &[u8]) -> Option<Vec<DecodedAniStep>> {
    if bytes.len() < 12 || &bytes[0..4] != b"RIFF" || &bytes[8..12] != b"ACON" {
        return None;
    }

    let riff_size = u32::from_le_bytes([bytes[4], bytes[5], bytes[6], bytes[7]]) as usize;
    let end = riff_size.saturating_add(8).min(bytes.len());

    let mut n_steps: Option<usize> = None;
    let mut default_disp_rate: u32 = 1;
    let mut rates: Vec<u32> = Vec::new();
    let mut seq: Vec<u32> = Vec::new();
    let mut frames: Vec<DecodedIconImage> = Vec::new();

    let mut pos = 12usize;
    while pos + 8 <= end {
        let chunk_id = &bytes[pos..pos + 4];
        let chunk_size = u32::from_le_bytes([
            bytes[pos + 4],
            bytes[pos + 5],
            bytes[pos + 6],
            bytes[pos + 7],
        ]) as usize;
        let data_start = pos + 8;
        let Some(data_end) = data_start.checked_add(chunk_size) else {
            break;
        };
        if data_end > end {
            break;
        }
        let chunk_data = &bytes[data_start..data_end];

        match chunk_id {
            b"anih" => {
                if chunk_data.len() >= 36 {
                    n_steps = Some(u32::from_le_bytes([
                        chunk_data[8],
                        chunk_data[9],
                        chunk_data[10],
                        chunk_data[11],
                    ]) as usize);
                    default_disp_rate = u32::from_le_bytes([
                        chunk_data[28],
                        chunk_data[29],
                        chunk_data[30],
                        chunk_data[31],
                    ])
                    .max(1);
                }
            }
            b"rate" => {
                for pair in chunk_data.chunks_exact(4) {
                    rates.push(u32::from_le_bytes([pair[0], pair[1], pair[2], pair[3]]));
                }
            }
            b"seq " => {
                for pair in chunk_data.chunks_exact(4) {
                    seq.push(u32::from_le_bytes([pair[0], pair[1], pair[2], pair[3]]));
                }
            }
            b"LIST" => {
                if chunk_data.len() >= 4 && &chunk_data[0..4] == b"fram" {
                    let mut fpos = 4usize;
                    while fpos + 8 <= chunk_data.len() {
                        let sub_id = &chunk_data[fpos..fpos + 4];
                        let sub_size = u32::from_le_bytes([
                            chunk_data[fpos + 4],
                            chunk_data[fpos + 5],
                            chunk_data[fpos + 6],
                            chunk_data[fpos + 7],
                        ]) as usize;
                        let sub_start = fpos + 8;
                        let Some(sub_end) = sub_start.checked_add(sub_size) else {
                            break;
                        };
                        if sub_end > chunk_data.len() {
                            break;
                        }
                        if sub_id == b"icon"
                            && let Some(decoded) =
                                decode_ico_or_cur_largest(&chunk_data[sub_start..sub_end])
                        {
                            frames.push(decoded);
                        }
                        fpos = sub_end + (sub_size & 1);
                    }
                }
            }
            _ => {}
        }

        pos = data_end + (chunk_size & 1);
    }

    if frames.is_empty() {
        return None;
    }

    let step_count = if !seq.is_empty() {
        seq.len()
    } else if !rates.is_empty() {
        rates.len()
    } else {
        n_steps.unwrap_or(frames.len()).max(frames.len())
    };

    let mut steps = Vec::with_capacity(step_count);
    for i in 0..step_count {
        let frame_idx = seq.get(i).copied().unwrap_or(i as u32) as usize;
        let Some(frame) = frames.get(frame_idx) else {
            continue;
        };
        let delay_jiffies = rates.get(i).copied().unwrap_or(default_disp_rate).max(1);
        steps.push(DecodedAniStep {
            rgba: frame.rgba.clone(),
            hotspot_x: frame.hotspot_x,
            hotspot_y: frame.hotspot_y,
            delay_jiffies,
        });
    }

    if steps.is_empty() { None } else { Some(steps) }
}

/// `RgbaImage` を PNG バイト列へエンコードする
pub fn encode_rgba_to_png_bytes(rgba: &RgbaImage) -> Option<Vec<u8>> {
    let mut out = Vec::new();
    let mut cursor = Cursor::new(&mut out);
    rgba.write_to(&mut cursor, ImageFormat::Png).ok()?;
    Some(out)
}

/// `RgbaImage` を PNG Data URL (`data:image/png;base64,...`) へエンコードする
pub fn encode_rgba_to_png_data_url(rgba: &RgbaImage) -> Option<String> {
    let png = encode_rgba_to_png_bytes(rgba)?;
    let b64 = base64::engine::general_purpose::STANDARD.encode(png);
    Some(format!("data:image/png;base64,{b64}"))
}

/// `.ico` / `.cur` バイト列を最大サイズ・透過付き PNG Data URL へ変換する
pub fn encode_ico_or_cur_to_png_data_url(bytes: &[u8]) -> Option<String> {
    let decoded = decode_ico_or_cur_largest(bytes)?;
    encode_rgba_to_png_data_url(&decoded.rgba)
}

/// `.ani` バイト列を APNG (`data:image/png;base64,...`) へ変換する（1フレームのみの場合は静止 PNG）
pub fn encode_ani_to_apng_data_url(bytes: &[u8]) -> Option<String> {
    let steps = decode_ani_steps(bytes)?;
    if steps.len() == 1 {
        return encode_rgba_to_png_data_url(&steps[0].rgba);
    }
    let apng = encode_ani_steps_to_apng_bytes(&steps)?;
    let b64 = base64::engine::general_purpose::STANDARD.encode(apng);
    Some(format!("data:image/png;base64,{b64}"))
}

/// 拡張子（小文字）に応じて `.ico` / `.cur` / `.ani` をデコードし、Web 表示用 PNG / APNG Data URL へ変換する
pub fn encode_win_icon_or_cursor_data_url(ext: &str, bytes: &[u8]) -> Option<String> {
    match ext {
        "ico" | "cur" => encode_ico_or_cur_to_png_data_url(bytes),
        "ani" => encode_ani_to_apng_data_url(bytes),
        _ => None,
    }
}

/// `.ani` ステップ列を APNG バイト列へエンコードする
pub fn encode_ani_steps_to_apng_bytes(steps: &[DecodedAniStep]) -> Option<Vec<u8>> {
    if steps.is_empty() {
        return None;
    }

    let canvas_w = steps.iter().map(|s| s.rgba.width()).max()?.max(1);
    let canvas_h = steps.iter().map(|s| s.rgba.height()).max()?.max(1);

    let normalized: Vec<RgbaImage> = steps
        .iter()
        .map(|s| {
            if s.rgba.width() == canvas_w && s.rgba.height() == canvas_h {
                s.rgba.clone()
            } else {
                let mut padded = RgbaImage::new(canvas_w, canvas_h);
                image::imageops::overlay(&mut padded, &s.rgba, 0, 0);
                padded
            }
        })
        .collect();

    let first_png = encode_rgba_to_png_bytes(&normalized[0])?;
    let (ihdr_data, first_idats) = extract_ihdr_and_idats(&first_png)?;

    let mut out = Vec::new();
    out.extend_from_slice(b"\x89PNG\r\n\x1a\n");
    write_png_chunk(&mut out, b"IHDR", &ihdr_data);

    // acTL: num_frames, num_plays (0 = infinite)
    let mut actl = Vec::with_capacity(8);
    actl.extend_from_slice(&(normalized.len() as u32).to_be_bytes());
    actl.extend_from_slice(&0u32.to_be_bytes());
    write_png_chunk(&mut out, b"acTL", &actl);

    let mut seq_num = 0u32;
    write_fctl_chunk(
        &mut out,
        seq_num,
        canvas_w,
        canvas_h,
        steps[0].delay_jiffies,
    );
    seq_num += 1;
    for idat in first_idats {
        write_png_chunk(&mut out, b"IDAT", &idat);
    }

    for (idx, frame_img) in normalized.iter().enumerate().skip(1) {
        let frame_png = encode_rgba_to_png_bytes(frame_img)?;
        let (_, idats) = extract_ihdr_and_idats(&frame_png)?;
        write_fctl_chunk(
            &mut out,
            seq_num,
            canvas_w,
            canvas_h,
            steps[idx].delay_jiffies,
        );
        seq_num += 1;
        for idat in idats {
            let mut fdat = Vec::with_capacity(4 + idat.len());
            fdat.extend_from_slice(&seq_num.to_be_bytes());
            fdat.extend_from_slice(&idat);
            seq_num += 1;
            write_png_chunk(&mut out, b"fdAT", &fdat);
        }
    }

    write_png_chunk(&mut out, b"IEND", &[]);
    Some(out)
}

fn write_fctl_chunk(out: &mut Vec<u8>, seq_num: u32, width: u32, height: u32, delay_jiffies: u32) {
    let delay_num = delay_jiffies.min(u16::MAX as u32) as u16;
    let delay_den = 60u16;
    let mut fctl = Vec::with_capacity(26);
    fctl.extend_from_slice(&seq_num.to_be_bytes());
    fctl.extend_from_slice(&width.to_be_bytes());
    fctl.extend_from_slice(&height.to_be_bytes());
    fctl.extend_from_slice(&0u32.to_be_bytes()); // x_offset
    fctl.extend_from_slice(&0u32.to_be_bytes()); // y_offset
    fctl.extend_from_slice(&delay_num.to_be_bytes());
    fctl.extend_from_slice(&delay_den.to_be_bytes());
    fctl.push(1); // dispose_op = APNG_DISPOSE_OP_BACKGROUND
    fctl.push(0); // blend_op = APNG_BLEND_OP_SOURCE
    write_png_chunk(out, b"fcTL", &fctl);
}

fn extract_ihdr_and_idats(png: &[u8]) -> Option<(Vec<u8>, Vec<Vec<u8>>)> {
    const PNG_SIG: &[u8; 8] = b"\x89PNG\r\n\x1a\n";
    if png.len() < 8 || &png[..8] != PNG_SIG {
        return None;
    }
    let mut ihdr: Option<Vec<u8>> = None;
    let mut idats: Vec<Vec<u8>> = Vec::new();
    let mut pos = 8usize;
    while pos + 12 <= png.len() {
        let len = u32::from_be_bytes([png[pos], png[pos + 1], png[pos + 2], png[pos + 3]]) as usize;
        let chunk_type = &png[pos + 4..pos + 8];
        let data_start = pos + 8;
        let data_end = data_start.checked_add(len)?;
        if data_end + 4 > png.len() {
            return None;
        }
        if chunk_type == b"IHDR" {
            ihdr = Some(png[data_start..data_end].to_vec());
        } else if chunk_type == b"IDAT" {
            idats.push(png[data_start..data_end].to_vec());
        } else if chunk_type == b"IEND" {
            break;
        }
        pos = data_end + 4;
    }
    Some((ihdr?, idats))
}

fn write_png_chunk(out: &mut Vec<u8>, chunk_type: &[u8; 4], data: &[u8]) {
    out.extend_from_slice(&(data.len() as u32).to_be_bytes());
    out.extend_from_slice(chunk_type);
    out.extend_from_slice(data);
    let crc = png_crc32(chunk_type, data);
    out.extend_from_slice(&crc.to_be_bytes());
}

fn png_crc32(chunk_type: &[u8; 4], data: &[u8]) -> u32 {
    let mut crc = 0xFFFF_FFFFu32;
    for &b in chunk_type.iter().chain(data.iter()) {
        crc ^= b as u32;
        for _ in 0..8 {
            let mask = (crc & 1).wrapping_neg();
            crc = (crc >> 1) ^ (0xEDB8_8320 & mask);
        }
    }
    !crc
}

/// 任意のアイコン・カーソル・画像バイト列を `CursorAssetData`（フレーム列 + ホットスポット + 待ち時間）へ変換する
pub fn decode_cursor_asset_from_bytes(ext: &str, bytes: &[u8]) -> Option<CursorAssetData> {
    match ext {
        "ani" => {
            let steps = decode_ani_steps(bytes)?;
            let mut frames = Vec::with_capacity(steps.len());
            for step in steps {
                let data_url = encode_rgba_to_png_data_url(&step.rgba)?;
                let duration_ms = ((step.delay_jiffies as u64 * 1000) / 60).max(16) as u32;
                frames.push(CursorFrameAsset {
                    data_url,
                    hotspot_x: step.hotspot_x,
                    hotspot_y: step.hotspot_y,
                    duration_ms,
                });
            }
            Some(CursorAssetData { frames })
        }
        "ico" | "cur" => {
            let decoded = decode_ico_or_cur_largest(bytes)?;
            let data_url = encode_rgba_to_png_data_url(&decoded.rgba)?;
            Some(CursorAssetData {
                frames: vec![CursorFrameAsset {
                    data_url,
                    hotspot_x: decoded.hotspot_x,
                    hotspot_y: decoded.hotspot_y,
                    duration_ms: 0,
                }],
            })
        }
        _ => {
            let mime = match ext {
                "svg" => "image/svg+xml",
                "bmp" => "image/bmp",
                "gif" => "image/gif",
                "webp" => "image/webp",
                "jpg" | "jpeg" => "image/jpeg",
                _ => "image/png",
            };
            let b64 = base64::engine::general_purpose::STANDARD.encode(bytes);
            Some(CursorAssetData {
                frames: vec![CursorFrameAsset {
                    data_url: format!("data:{mime};base64,{b64}"),
                    hotspot_x: 0,
                    hotspot_y: 0,
                    duration_ms: 0,
                }],
            })
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_png_bytes(width: u32, height: u32, rgba: [u8; 4]) -> Vec<u8> {
        let img = RgbaImage::from_pixel(width, height, image::Rgba(rgba));
        encode_rgba_to_png_bytes(&img).unwrap()
    }

    fn make_ico_or_cur(icon_type: u16, entries: &[(u8, u8, u16, u16, Vec<u8>)]) -> Vec<u8> {
        let mut out = Vec::new();
        out.extend_from_slice(&0u16.to_le_bytes());
        out.extend_from_slice(&icon_type.to_le_bytes());
        out.extend_from_slice(&(entries.len() as u16).to_le_bytes());

        let mut offset = 6 + entries.len() * 16;
        for (w, h, p1, p2, data) in entries {
            out.push(*w);
            out.push(*h);
            out.push(0);
            out.push(0);
            out.extend_from_slice(&p1.to_le_bytes());
            out.extend_from_slice(&p2.to_le_bytes());
            out.extend_from_slice(&(data.len() as u32).to_le_bytes());
            out.extend_from_slice(&(offset as u32).to_le_bytes());
            offset += data.len();
        }
        for (_, _, _, _, data) in entries {
            out.extend_from_slice(data);
        }
        out
    }

    fn make_riff_chunk(id: &[u8; 4], data: &[u8]) -> Vec<u8> {
        let mut out = Vec::with_capacity(8 + data.len() + (data.len() & 1));
        out.extend_from_slice(id);
        out.extend_from_slice(&(data.len() as u32).to_le_bytes());
        out.extend_from_slice(data);
        if data.len() & 1 == 1 {
            out.push(0);
        }
        out
    }

    #[test]
    fn test_ico_selects_largest_size_and_preserves_alpha() {
        let small = make_png_bytes(16, 16, [255, 0, 0, 128]);
        let large = make_png_bytes(48, 48, [0, 255, 0, 64]);
        let ico = make_ico_or_cur(1, &[(16, 16, 1, 32, small), (48, 48, 1, 32, large)]);

        let decoded = decode_ico_or_cur_largest(&ico).unwrap();
        assert_eq!(decoded.rgba.dimensions(), (48, 48));
        assert_eq!(decoded.rgba.get_pixel(0, 0).0, [0, 255, 0, 64]);
    }

    #[test]
    fn test_cur_extracts_hotspot_and_selects_largest() {
        let small = make_png_bytes(16, 16, [10, 20, 30, 255]);
        let large = make_png_bytes(32, 32, [40, 50, 60, 200]);
        let cur = make_ico_or_cur(2, &[(16, 16, 2, 3, small), (32, 32, 12, 18, large)]);

        let decoded = decode_ico_or_cur_largest(&cur).unwrap();
        assert_eq!(decoded.rgba.dimensions(), (32, 32));
        assert_eq!(decoded.hotspot_x, 12);
        assert_eq!(decoded.hotspot_y, 18);
        assert_eq!(decoded.rgba.get_pixel(0, 0).0, [40, 50, 60, 200]);
    }

    #[test]
    fn test_ani_respects_seq_and_rate_and_encodes_apng() {
        let frame0 = make_ico_or_cur(
            2,
            &[(16, 16, 4, 5, make_png_bytes(16, 16, [255, 0, 0, 255]))],
        );
        let frame1 = make_ico_or_cur(
            2,
            &[(16, 16, 8, 9, make_png_bytes(16, 16, [0, 0, 255, 128]))],
        );

        let mut anih = [0u8; 36];
        anih[0..4].copy_from_slice(&36u32.to_le_bytes());
        anih[4..8].copy_from_slice(&2u32.to_le_bytes()); // nFrames
        anih[8..12].copy_from_slice(&3u32.to_le_bytes()); // nSteps
        anih[28..32].copy_from_slice(&10u32.to_le_bytes()); // iDispRate
        anih[32..36].copy_from_slice(&3u32.to_le_bytes()); // AF_ICON | AF_SEQUENCE

        let mut seq_data = Vec::new();
        for idx in [1u32, 0u32, 1u32] {
            seq_data.extend_from_slice(&idx.to_le_bytes());
        }
        let mut rate_data = Vec::new();
        for jiffies in [6u32, 12u32, 18u32] {
            rate_data.extend_from_slice(&jiffies.to_le_bytes());
        }

        let mut fram_inner = Vec::new();
        fram_inner.extend_from_slice(b"fram");
        fram_inner.extend_from_slice(&make_riff_chunk(b"icon", &frame0));
        fram_inner.extend_from_slice(&make_riff_chunk(b"icon", &frame1));

        let mut acon_body = Vec::new();
        acon_body.extend_from_slice(b"ACON");
        acon_body.extend_from_slice(&make_riff_chunk(b"anih", &anih));
        acon_body.extend_from_slice(&make_riff_chunk(b"seq ", &seq_data));
        acon_body.extend_from_slice(&make_riff_chunk(b"rate", &rate_data));
        acon_body.extend_from_slice(&make_riff_chunk(b"LIST", &fram_inner));

        let mut ani = Vec::new();
        ani.extend_from_slice(b"RIFF");
        ani.extend_from_slice(&(acon_body.len() as u32).to_le_bytes());
        ani.extend_from_slice(&acon_body);

        let steps = decode_ani_steps(&ani).unwrap();
        assert_eq!(steps.len(), 3);
        assert_eq!(steps[0].rgba.get_pixel(0, 0).0, [0, 0, 255, 128]);
        assert_eq!(steps[0].hotspot_x, 8);
        assert_eq!(steps[0].delay_jiffies, 6);
        assert_eq!(steps[1].rgba.get_pixel(0, 0).0, [255, 0, 0, 255]);
        assert_eq!(steps[1].delay_jiffies, 12);
        assert_eq!(steps[2].rgba.get_pixel(0, 0).0, [0, 0, 255, 128]);
        assert_eq!(steps[2].delay_jiffies, 18);

        let apng = encode_ani_steps_to_apng_bytes(&steps).unwrap();
        assert!(apng.starts_with(b"\x89PNG\r\n\x1a\n"));
        assert!(apng.windows(4).any(|w| w == b"acTL"));
        assert!(apng.windows(4).any(|w| w == b"fcTL"));
        assert!(apng.windows(4).any(|w| w == b"fdAT"));
    }
}
