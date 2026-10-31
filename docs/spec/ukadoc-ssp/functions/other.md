# その他の機能

- **規格**: [functions/other.md](https://ukatech.shillest.net/ukadoc-ssp/functions/other/) (ukadoc-ssp/functions/other.md)
- **対応状況**: ⚠️ 一部対応

## 突合結果

タスクトレイ格納（Android 常駐通知・スナップ退避）

## 実装箇所

- `src-tauri/src/commands/config.rs:52` `(_, other) => {`
- `src-tauri/src/commands/config.rs:53` `base_map.insert(k, other);`
- `src-tauri/src/commands/ext.rs:47` `// [readme,ファイル名], [readme.charset,文字コード], [charset,文字コード], [secondchangeinterva`
- `src-tauri/src/commands/ext.rs:52` `let _other_talk = map.get("otherghosttalk");`
- `crates/ui/src/vfs.rs:146` `let other = sub.join("AA_Other.txt");`
