# 機能

- **規格**: [index.md](../../../../docs/ukadoc-ssp/functions/index.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/functions/))
- **対応状況**: ✅ 実装済

機能一覧インデックスの整理

| 仕様項目 | 対応状況 | 実装・備考 |
| :--- | :---: | :--- |
| [項目がグレーで選べない時](index/section-01.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/index.md の「項目がグレーで選べない時」 |
| [各項目の解説](index/section-02.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/index.md の「各項目の解説」 |
| [カレンダー](index/section-03.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/index.md の「カレンダー」 |
| [SSPメッセンジャー](index/section-04.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/index.md の「SSPメッセンジャー」 |
| [時刻合わせ](index/section-05.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/index.md の「時刻合わせ」 |
| [エクスプローラ](index/section-06.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/index.md の「エクスプローラ」 |
| [画像ビューワ](index/section-07.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/index.md の「画像ビューワ」 |
| [アーカイブビューワ](index/section-08.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/index.md の「アーカイブビューワ」 |
| [バックログ](index/section-09.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/index.md の「バックログ」 |
| [本体更新をチェック](index/section-10.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/index.md の「本体更新をチェック」 |
| [音声認識](index/section-11.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/index.md の「音声認識」 |
| [音声合成](index/section-12.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/index.md の「音声合成」 |
| [アドレスバー](index/section-13.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/index.md の「アドレスバー」 |
| [ファイルを開く](index/section-14.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/index.md の「ファイルを開く」 |
| [フォルダを選択する](index/section-15.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/index.md の「フォルダを選択する」 |
| [ゴーストキャッシュ開放](index/section-16.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/index.md の「ゴーストキャッシュ開放」 |
| [FMOの整理／更新](index/section-17.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/index.md の「FMOの整理／更新」 |
| [動作情報再読み込み](index/section-18.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/index.md の「動作情報再読み込み」 |
| [ゴースト再読み込み](index/section-19.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/index.md の「ゴースト再読み込み」 |
| [一時起動ゴーストを保持](index/section-20.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/index.md の「一時起動ゴーストを保持」 |
| [シェル位置初期化](index/section-21.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/index.md の「シェル位置初期化」 |
| [バルーン位置初期化](index/section-22.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/index.md の「バルーン位置初期化」 |
| [バルーンを消す](index/section-23.md) | ✅ 実装済 | docs/ukadoc-ssp/functions/index.md の「バルーンを消す」 |

## 実装箇所

- `src-tauri/src/commands/calendar.rs:2` `//! [calendar/index.md], [calendar/schedule.md], [calendar/menu.md], [\![open,ca`
- `src-tauri/src/commands/file.rs:164` `if let Some(index) = recent_files.iter().position(|x| *x == path) {`
- `src-tauri/src/commands/file.rs:165` `recent_files.remove(index);`
- `src-tauri/src/commands/install/archive/extraction.rs:13` `.by_index(i)`
- `src-tauri/src/commands/install/archive/inspection.rs:23` `if let Ok(entry) = zip.by_index(i) {`
