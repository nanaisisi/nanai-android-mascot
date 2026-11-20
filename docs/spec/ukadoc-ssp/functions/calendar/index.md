# カレンダー

- **規格**: [calendar/index.md](../../../../../docs/ukadoc-ssp/functions/calendar/index.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/functions/calendar/))
- **対応状況**: ✅ 対応済

スケジュール・アラーム管理機能 (`src-tauri/src/commands/calendar.rs`) およびアプリデータディレクトリへの JSON 永続化 (`schedules.json`) の実装完了。

| 仕様項目 | 対応状況 | 実装・備考 |
| :--- | :---: | :--- |
| [ゴーストによる予定の読み上げ](index/section-01.md) | ✅ 対応済 | docs/ukadoc-ssp/functions/calendar/index.md の「ゴーストによる予定の読み上げ」 |
| [ネットワークによるスケジュール共有](index/section-02.md) | ✅ 対応済 | docs/ukadoc-ssp/functions/calendar/index.md の「ネットワークによるスケジュール共有」 |
| [カレンダースキン](index/section-03.md) | ✅ 対応済 | docs/ukadoc-ssp/functions/calendar/index.md の「カレンダースキン」 |

## 実装箇所

- `src-tauri/src/commands/calendar.rs:2` `//! [calendar/index.md], [calendar/schedule.md], [calendar/menu.md], [\![open,ca`
- `src-tauri/src/commands/file.rs:164` `if let Some(index) = recent_files.iter().position(|x| *x == path) {`
- `src-tauri/src/commands/file.rs:165` `recent_files.remove(index);`
- `src-tauri/src/commands/install/archive/extraction.rs:13` `.by_index(i)`
- `src-tauri/src/commands/install/archive/inspection.rs:23` `if let Ok(entry) = zip.by_index(i) {`
