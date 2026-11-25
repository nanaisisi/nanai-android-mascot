# エクスプローラ

- **規格**: [explorer/index.md](../../../../../docs/ukadoc-ssp/functions/explorer/index.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/functions/explorer/))
- **対応状況**: ✅ 実装済

ゴースト・バルーン一覧モーダル、切り替え基盤

| 仕様項目 | 対応状況 | 実装・備考 |
| :--- | :---: | :--- |
| [基本操作](index/section-01.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/explorer/index.md の「基本操作」 |
| [上部の各メニュー](index/section-02.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/explorer/index.md の「上部の各メニュー」 |
| [ファイル](index/section-03.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/explorer/index.md の「ファイル」 |
| [編集](index/section-04.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/explorer/index.md の「編集」 |
| [種類](index/section-05.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/explorer/index.md の「種類」 |
| [機能](index/section-06.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/explorer/index.md の「機能」 |
| [設定](index/section-07.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/explorer/index.md の「設定」 |
| [下部のボタン](index/section-08.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/explorer/index.md の「下部のボタン」 |

## 実装箇所

- `src-tauri/src/commands/calendar.rs:2` `//! [calendar/index.md], [calendar/schedule.md], [calendar/menu.md], [\![open,ca`
- `src-tauri/src/commands/file.rs:164` `if let Some(index) = recent_files.iter().position(|x| *x == path) {`
- `src-tauri/src/commands/file.rs:165` `recent_files.remove(index);`
- `src-tauri/src/commands/install/archive/extraction.rs:13` `.by_index(i)`
- `src-tauri/src/commands/install/archive/inspection.rs:23` `if let Ok(entry) = zip.by_index(i) {`
