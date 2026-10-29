# *.refresh,数値

- **規格**: [star-.refresh.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/star-.refresh.md)
- **検索語**: *.refresh
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `*.refresh`（`ghost.refresh`, `shell.refresh` 等）をパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive.rs` `// [*.directory,ディレクトリ名]... [*.refresh,数値], [*.refreshundeletemask...`
