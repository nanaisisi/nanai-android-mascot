# 設定

- **規格**: [explorer/index.md](../../../../../../docs/ukadoc-ssp/functions/explorer/index.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/functions/explorer/))
- **対応状況**: ✅ 実装済

## 突合結果

docs/ukadoc-ssp/functions/explorer/index.md の「設定」に関する仕様項目。 ゴースト・バルーン一覧モーダル、切り替え基盤

## 実装箇所

- `src-tauri/src/commands/calendar.rs:2` `//! [calendar/index.md], [calendar/schedule.md], [calendar/menu.md], [\![open,ca`
- `src-tauri/src/commands/file.rs:164` `if let Some(index) = recent_files.iter().position(|x| *x == path) {`
- `src-tauri/src/commands/file.rs:165` `recent_files.remove(index);`
- `src-tauri/src/commands/install/archive/extraction.rs:13` `.by_index(i)`
- `src-tauri/src/commands/install/archive/inspection.rs:23` `if let Ok(entry) = zip.by_index(i) {`
