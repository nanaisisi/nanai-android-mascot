# refreshundeletemask,ファイル名1:ファイル名2...

- **規格**: [refreshundeletemask.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/refreshundeletemask.md)
- **検索語**: refreshundeletemask
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `refreshundeletemask` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive.rs:54` `// [refresh,数値], [refreshundeletemask,ファイル名1:ファイル名2...]:`
- `src-tauri/src/commands/install/archive.rs:55` `// [*.directory,ディレクトリ名], [*.source.directory,ディレクトリ名], [*.refresh,数値], [*.refre`
- `src-tauri/src/commands/install/archive.rs:68` `let _refreshmask = map.get("refreshundeletemask");`
- `src-tauri/src/commands/install/archive.rs:73` `.get("ghost.refreshundeletemask")`
- `src-tauri/src/commands/install/archive.rs:74` `.or_else(|| map.get("shell.refreshundeletemask"));`
