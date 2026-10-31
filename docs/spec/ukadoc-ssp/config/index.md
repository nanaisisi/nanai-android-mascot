# 設定

- **規格**: [config/index.md](https://ukatech.shillest.net/ukadoc-ssp/config/index/) (ukadoc-ssp/config/index.md)
- **対応状況**: ✅ 実装済

## 突合結果

タブ形式の設定モーダル展開

## 実装箇所

- `src-tauri/src/commands/calendar.rs:2` `//! [calendar/index.md], [calendar/schedule.md], [calendar/menu.md], [\![open,ca`
- `src-tauri/src/commands/file.rs:164` `if let Some(index) = recent_files.iter().position(|x| *x == path) {`
- `src-tauri/src/commands/file.rs:165` `recent_files.remove(index);`
- `src-tauri/src/commands/install/archive/extraction.rs:12` `.by_index(i)`
- `src-tauri/src/commands/install/archive/inspection.rs:22` `if let Ok(entry) = zip.by_index(i) {`
