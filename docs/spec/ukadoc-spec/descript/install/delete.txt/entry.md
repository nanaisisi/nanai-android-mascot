# 相対パス

- **規格**: [entry.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/delete.txt/entry/) (ukadoc-spec/descript/install/delete.txt/entry.md)
- **検索語**: 相対パス
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `delete.txt` 内の相対パス行を 1 行ずつ読み込み、対象ディレクトリ・ファイルを安全に自動削除する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive.rs` `// [delete.txt]: インストール・更新時の指定ファイル自動削除処理...`
