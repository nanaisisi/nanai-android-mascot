//! FMO レコード一覧に対する名前・HWND 検索およびフィルタリングクエリ

use super::super::types::FmoRecord;

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

/// ゴーストが存在するかを大文字小文字無視で判定
pub fn has_ghost(records: &[FmoRecord], name: &str) -> bool {
    find_record_by_name(records, name).is_some()
}

/// アクティブ（一時停止・停止状態でない）ゴーストレコードのみを抽出
pub fn filter_active_records(records: &[FmoRecord]) -> Vec<&FmoRecord> {
    records
        .iter()
        .filter(|r| {
            if let Some(ref ms) = r.modulestate {
                !ms.split(',')
                    .any(|part| part == "lifecycle:paused" || part == "lifecycle:stopped")
            } else {
                true
            }
        })
        .collect()
}

/// 可視（不可視・最小化状態でない）ゴーストレコードのみを抽出
pub fn filter_visible_records(records: &[FmoRecord]) -> Vec<&FmoRecord> {
    records
        .iter()
        .filter(|r| {
            if let Some(ref ms) = r.modulestate {
                !ms.split(',').any(|part| {
                    part == "lifecycle:invisible"
                        || part == "lifecycle:paused"
                        || part == "lifecycle:stopped"
                })
            } else {
                true
            }
        })
        .collect()
}

/// 全てのゴースト名（重複なし・昇順）を抽出
pub fn extract_ghost_names(records: &[FmoRecord]) -> Vec<String> {
    let mut names = Vec::new();
    for r in records {
        if !r.name.is_empty() && !names.contains(&r.name) {
            names.push(r.name.clone());
        }
    }
    names.sort();
    names
}
