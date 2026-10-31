# その他の機能

- **規格**: [functions/other.md](https://ukatech.shillest.net/ukadoc-ssp/functions/other/) (ukadoc-ssp/functions/other.md)
- **対応状況**: ✅ 実装済

## 突合結果

タスクトレイ格納（Android 常駐通知・スナップ退避）

## 実装箇所

- `src-tauri/src/commands/config.rs:52` `(_, other) => {`
- `src-tauri/src/commands/config.rs:53` `base_map.insert(k, other);`
- `src-tauri/src/commands/ext.rs:47` `// [readme,ファイル名], [readme.charset,文字コード], [charset,文字コード], [secondchangeinterva`
- `src-tauri/src/commands/ext.rs:52` `let _other_talk = map.get("otherghosttalk");`
- `src-tauri/src/shiori/property.rs:31` `"other_homeurl_override" | "other_homeurl" => "https://example.com/ghost/".to_st`
