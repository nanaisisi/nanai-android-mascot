# memo/ 開発メモ仕様対応一覧

- **対応状況**: ✅ 対応済
- **概要**: UKADOC 開発メモ (`memo/`) の各項目（ベースウェア機能比較、SHIORIイベント解説）に対する Nanai Android Mascot の実装対応一覧。

## 対応項目

- `memo.md`: ベースウェアの機能比較・互換メモ - ✅ 対応済
- `shiori-event.md`: SHIORI Event 解説・GET/NOTIFY コマンド仕様 - ✅ 対応済

## 実装箇所

- `src-tauri/gen/android/app/build/intermediates/assets/arm64Debug/mergeArm64DebugAssets/tauri.conf.json:1` `{"$schema":"https://schema.tauri.app/config/2","productName":"nanai-android-masc`
- `src-tauri/gen/android/app/src/main/assets/tauri.conf.json:1` `{"$schema":"https://schema.tauri.app/config/2","productName":"nanai-android-masc`
- `src-tauri/src/commands/calendar.rs:2` `//! [calendar/index.md], [calendar/schedule.md], [calendar/menu.md], [\![open,ca`
- `src-tauri/src/commands/file.rs:164` `if let Some(index) = recent_files.iter().position(|x| *x == path) {`
- `src-tauri/src/commands/file.rs:165` `recent_files.remove(index);`
