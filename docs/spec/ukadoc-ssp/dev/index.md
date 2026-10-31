# 開発者向けヘルプ

- **規格**: [dev/index.md](https://ukatech.shillest.net/ukadoc-ssp/dev/index/) (ukadoc-ssp/dev/index.md)
- **対応状況**: ✅ 実装済

## 突合結果

開発支援機能（F12 DevTools、パレット等）

## 実装箇所

- `src-tauri/src/commands/calendar.rs:2` `//! [calendar/index.md], [calendar/schedule.md], [calendar/menu.md], [\![open,ca`
- `src-tauri/src/commands/file.rs:164` `if let Some(index) = recent_files.iter().position(|x| *x == path) {`
- `src-tauri/src/commands/file.rs:165` `recent_files.remove(index);`
- `src-tauri/src/commands/install/archive/extraction.rs:12` `.by_index(i)`
- `src-tauri/src/commands/install/archive/inspection.rs:22` `if let Ok(entry) = zip.by_index(i) {`
