use crate::fmo::types::FmoRecord;
use std::collections::HashMap;

/// FMO レコード群から UKADOC 規格準拠のテキスト表現を生成する (GetFMO / FMO/1.0 準拠)
/// `is_remote` が true の場合、機密パス情報 (path, ghostpath) を隠蔽し、HWND を 0 にダミー化する
pub fn format_fmo_text(records: &[FmoRecord], is_remote: bool) -> String {
    let mut content = String::new();
    for rec in records {
        let prefix = if rec.id.starts_with("ssp_fmo_header_") {
            rec.id.clone()
        } else {
            format!("ssp_fmo_header_{}", rec.id)
        };

        if !is_remote {
            content.push_str(&format!("{}.path\x01{}\r\n", prefix, rec.path));
        }

        let hwnd_val = if is_remote { 0 } else { rec.hwnd };
        content.push_str(&format!("{}.hwnd\x01{}\r\n", prefix, hwnd_val));

        content.push_str(&format!("{}.name\x01{}\r\n", prefix, rec.name));
        content.push_str(&format!("{}.keroname\x01{}\r\n", prefix, rec.keroname));
        content.push_str(&format!(
            "{}.sakura.surface\x01{}\r\n",
            prefix, rec.sakura_surface
        ));
        content.push_str(&format!(
            "{}.kero.surface\x01{}\r\n",
            prefix, rec.kero_surface
        ));

        if let Some(khwnd) = rec.kerohwnd {
            let khwnd_val = if is_remote { 0 } else { khwnd };
            content.push_str(&format!("{}.kerohwnd\x01{}\r\n", prefix, khwnd_val));
        }

        if !rec.hwndlist.is_empty() {
            let list_str = if is_remote {
                "0".to_string()
            } else {
                rec.hwndlist
                    .iter()
                    .map(|h| h.to_string())
                    .collect::<Vec<_>>()
                    .join(",")
            };
            content.push_str(&format!("{}.hwndlist\x01{}\r\n", prefix, list_str));
        }

        if !is_remote {
            content.push_str(&format!("{}.ghostpath\x01{}\r\n", prefix, rec.ghostpath));
        }

        if let Some(ref fn_str) = rec.fullname {
            content.push_str(&format!("{}.fullname\x01{}\r\n", prefix, fn_str));
        }

        if let Some(ref ms) = rec.modulestate {
            content.push_str(&format!("{}.modulestate\x01{}\r\n", prefix, ms));
        }
    }
    content
}

/// FMO 64KB 共有メモリバッファを生成する (ukadoc-spec 準拠)
pub fn generate_fmo_buffer(records: &[FmoRecord]) -> Vec<u8> {
    let content = format_fmo_text(records, false);

    let mut buf = vec![0u8; 65536];
    let size_bytes = (65536u32).to_le_bytes();
    buf[0..4].copy_from_slice(&size_bytes);

    let bytes = content.as_bytes();
    // 最大データ部サイズ: 65531バイト (65536 - 4バイトヘッダ - 1バイト終端NULL)
    let write_len = std::cmp::min(bytes.len(), 65531);
    buf[4..4 + write_len].copy_from_slice(&bytes[0..write_len]);
    buf[4 + write_len] = 0;

    buf
}

/// FMO 64KB 共有メモリバッファからレコード一覧をパースする
pub fn parse_fmo_buffer(buf: &[u8]) -> Result<Vec<FmoRecord>, String> {
    if buf.len() < 5 {
        return Err("FMO buffer too small".to_string());
    }

    // 0~3バイト目: バッファサイズ (Little Endian)
    let _total_size = u32::from_le_bytes([buf[0], buf[1], buf[2], buf[3]]);

    // 4バイト目以降のNULL終端または末尾まで
    let data_slice = &buf[4..];
    let null_pos = data_slice
        .iter()
        .position(|&b| b == 0)
        .unwrap_or(data_slice.len());
    let text = String::from_utf8_lossy(&data_slice[..null_pos]);

    // prefix -> Map<key, value>
    let mut entries: HashMap<String, HashMap<String, String>> = HashMap::new();
    let mut order = Vec::new();

    for line in text.lines() {
        let line = line.trim();
        if line.is_empty() {
            continue;
        }

        if let Some((field, val)) = line.split_once('\x01') {
            // 例: "ssp_fmo_header_00004468_000f0dea.sakura.surface"
            // prefix は識別ID部分（ssp_fmo_header_<id> または <id>）
            let (prefix, key) = if let Some(stripped) = field.strip_prefix("ssp_fmo_header_") {
                if let Some((id_part, sub_key)) = stripped.split_once('.') {
                    (format!("ssp_fmo_header_{}", id_part), sub_key)
                } else {
                    continue;
                }
            } else if let Some((prefix_part, sub_key)) = field.split_once('.') {
                (prefix_part.to_string(), sub_key)
            } else {
                continue;
            };

            if !entries.contains_key(&prefix) {
                order.push(prefix.clone());
            }
            entries
                .entry(prefix)
                .or_default()
                .insert(key.to_string(), val.to_string());
        }
    }

    let mut records = Vec::new();
    let mut seen_ids = std::collections::HashSet::new();
    for prefix in order {
        if let Some(map) = entries.get(&prefix) {
            let id = prefix
                .strip_prefix("ssp_fmo_header_")
                .unwrap_or(&prefix)
                .to_string();
            if !seen_ids.insert(id.clone()) {
                continue; // Prevent duplicate records if prefix appeared multiple times or clashes
            }
            let path = map.get("path").cloned().unwrap_or_default();
            let hwnd = map.get("hwnd").and_then(|h| h.parse().ok()).unwrap_or(0);
            let name = map.get("name").cloned().unwrap_or_default();
            let keroname = map.get("keroname").cloned().unwrap_or_default();
            let sakura_surface = map
                .get("sakura.surface")
                .and_then(|s| s.parse().ok())
                .unwrap_or(0);
            let kero_surface = map
                .get("kero.surface")
                .and_then(|s| s.parse().ok())
                .unwrap_or(10);
            let ghostpath = map.get("ghostpath").cloned().unwrap_or_default();
            let kerohwnd = map.get("kerohwnd").and_then(|h| h.parse().ok());
            let hwndlist = map
                .get("hwndlist")
                .map(|hl| {
                    hl.split(',')
                        .filter_map(|s| s.trim().parse::<u64>().ok())
                        .collect()
                })
                .unwrap_or_default();
            let fullname = map.get("fullname").cloned();
            let modulestate = map.get("modulestate").cloned();

            records.push(FmoRecord {
                id,
                path,
                hwnd,
                name,
                keroname,
                sakura_surface,
                kero_surface,
                ghostpath,
                kerohwnd,
                hwndlist,
                fullname,
                modulestate,
            });
        }
    }

    Ok(records)
}

/// 名前による FMO レコード検索 (大文字小文字無視)
pub fn find_record_by_name<'a>(records: &'a [FmoRecord], name: &str) -> Option<&'a FmoRecord> {
    records.iter().find(|r| {
        r.name.eq_ignore_ascii_case(name)
            || r.keroname.eq_ignore_ascii_case(name)
            || r.fullname
                .as_deref()
                .map(|f| f.eq_ignore_ascii_case(name))
                .unwrap_or(false)
    })
}

/// HWND による FMO レコード検索
pub fn find_record_by_hwnd(records: &[FmoRecord], hwnd: u64) -> Option<&FmoRecord> {
    if hwnd == 0 {
        return None;
    }
    records
        .iter()
        .find(|r| r.hwnd == hwnd || r.kerohwnd == Some(hwnd) || r.hwndlist.contains(&hwnd))
}
