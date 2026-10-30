# refresh,数値

- **規格**: [refresh.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/refresh.md)
- **検索語**: refresh
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `refresh` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive.rs:54` `// [refresh,数値], [refreshundeletemask,ファイル名1:ファイル名2...]:`
- `src-tauri/src/commands/install/archive.rs:55` `// [*.directory,ディレクトリ名], [*.source.directory,ディレクトリ名], [*.refresh,数値], [*.refre`
- `src-tauri/src/commands/install/archive.rs:64` `let _refresh = map.get("refresh");`
- `src-tauri/src/commands/install/archive.rs:65` `let _refreshmask = map.get("refreshundeletemask");`
- `src-tauri/src/commands/install/archive.rs:66` `let _star_refresh = map.get("ghost.refresh").or_else(|| map.get("shell.refresh")`
