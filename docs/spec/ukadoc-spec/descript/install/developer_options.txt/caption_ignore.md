# 自動的に除外される対象

- **規格**: [caption_ignore.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/developer_options.txt/caption_ignore/) (ukadoc-spec/descript/install/developer_options.txt/caption_ignore.md)
- **検索語**: 自動的に除外される対象
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `developer_options.txt` に記載された自動除外定義（`.dev_ignore`, `.git` 等）を判定・処理する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:62` `// [developer_options.txt], [自動的に除外される対象], [相対パス,オプション1,オプション2,...]:`
