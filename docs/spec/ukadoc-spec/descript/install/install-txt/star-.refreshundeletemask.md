# *.refreshundeletemask,ファイル名1:ファイル名2...

- **規格**: [star-.refreshundeletemask.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/star-.refreshundeletemask.md)
- **検索語**: *.refreshundeletemask
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `*.refreshundeletemask`（`ghost.refreshundeletemask` 等）をパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive.rs:55` `// [*.directory,ディレクトリ名], [*.source.directory,ディレクトリ名], [*.refresh,数値], [*.refre`
