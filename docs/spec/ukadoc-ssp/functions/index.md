# 機能

- **規格**: [functions/index.md](https://ukatech.shillest.net/ukadoc-ssp/functions/index/) (ukadoc-ssp/functions/index.md)
- **対応状況**: ✅ 実装済

## 突合結果

機能一覧インデックスの整理

## 実装箇所

- `src-tauri/src/commands/calendar.rs:2` `//! [calendar/index.md], [calendar/schedule.md], [calendar/menu.md], [\![open,ca`
- `src-tauri/src/commands/file.rs:164` `if let Some(index) = recent_files.iter().position(|x| *x == path) {`
- `src-tauri/src/commands/file.rs:165` `recent_files.remove(index);`
- `src-tauri/src/commands/install/archive.rs:13` `if let Ok(entry) = zip.by_index(i) {`
- `src-tauri/src/commands/install/archive.rs:45` `&& let Ok(mut entry) = zip.by_index(idx)`
