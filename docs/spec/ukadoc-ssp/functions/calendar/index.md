# カレンダー

- **規格**: [functions/calendar/index.md](https://ukatech.shillest.net/ukadoc-ssp/functions/calendar/index/) (ukadoc-ssp/functions/calendar/index.md)
- **対応状況**: ✅ 対応済

## 突合結果

スケジュール・アラーム管理機能 (`src-tauri/src/commands/calendar.rs`) およびアプリデータディレクトリへの JSON 永続化 (`schedules.json`) の実装完了。

## 実装箇所

- `src-tauri/gen/android/app/build/intermediates/assets/arm64Debug/mergeArm64DebugAssets/tauri.conf.json:1` `{"$schema":"https://schema.tauri.app/config/2","productName":"nanai-android-masc`
- `src-tauri/gen/android/app/src/main/assets/tauri.conf.json:1` `{"$schema":"https://schema.tauri.app/config/2","productName":"nanai-android-masc`
- `src-tauri/src/commands/calendar.rs:2` `//! [calendar/index.md], [calendar/schedule.md], [calendar/menu.md], [\![open,ca`
- `src-tauri/src/commands/file.rs:164` `if let Some(index) = recent_files.iter().position(|x| *x == path) {`
- `src-tauri/src/commands/file.rs:165` `recent_files.remove(index);`
