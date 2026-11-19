# *.refreshundeletemask,ファイル名1:ファイル名2...

- **規格**: [star-.refreshundeletemask.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/star-.refreshundeletemask.md)
- **検索語**: *.refreshundeletemask
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/commands/install/archive/inspection/analyzer/resource_resolver.rs` および `postprocess.rs` において `*.refreshundeletemask`（`balloon.refreshundeletemask`, `ghost0.refreshundeletemask` 等）の解析および削除保護マスク適用が完全実装済み。

## 実装箇所

- `src-tauri/src/commands/install/archive/inspection/analyzer/resource_resolver.rs` (`.refreshundeletemask`)
- `src-tauri/src/commands/install/archive/postprocess.rs` (`perform_refresh_cleanup`)
