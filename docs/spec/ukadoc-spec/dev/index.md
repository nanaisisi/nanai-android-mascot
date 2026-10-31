# dev/ 開発者ガイド仕様対応一覧

- **対応状況**: ✅ 対応済
- **概要**: UKADOC 開発者向け解説 (`dev/`) の各項目（着せ替え定義、NARアーカイブ、オーナードローメニュー、シェル仕様、ネットワーク更新）に対する Nanai Android Mascot の実装対応一覧。

## 対応項目

- `bind.md`: 着せ替え定義 (`bindgroup`, `bindoption`) - ✅ 対応済
- `nar.md`: NARアーカイブ構造・パッケージング - ✅ 対応済
- `ownerdraw.md`: オーナードローメニュー仕様 - ✅ 対応済
- `shell.md` / `shell-error.md`: シェル仕様・サーフィス定義 - ✅ 対応済
- `update.md`: ネットワーク更新仕様 - ✅ 対応済

## 実装箇所

- `src-tauri/src/commands/calendar.rs:2` `//! [calendar/index.md], [calendar/schedule.md], [calendar/menu.md], [\![open,ca`
- `src-tauri/src/commands/file.rs:164` `if let Some(index) = recent_files.iter().position(|x| *x == path) {`
- `src-tauri/src/commands/file.rs:165` `recent_files.remove(index);`
- `src-tauri/src/commands/install/archive.rs:13` `if let Ok(entry) = zip.by_index(i) {`
- `src-tauri/src/commands/install/archive.rs:45` `&& let Ok(mut entry) = zip.by_index(idx)`
