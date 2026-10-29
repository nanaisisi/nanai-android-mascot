# 相対パス,オプション1,オプション2,...

- **規格**: [entry.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/developer_options.txt/entry/) (ukadoc-spec/descript/install/developer_options.txt/entry.md)
- **検索語**: 相対パス,オプション1,オプション2,...
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `developer_options.txt` 内の相対パスおよび各種オプション指定行を解析・読み込む実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs` `// [developer_options.txt], [自動的に除外される対象], [相対パス,オプション1,オプション2,...]:`
