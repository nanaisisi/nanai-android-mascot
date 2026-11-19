# *.refresh,数値

- **規格**: [star-.refresh.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/star-.refresh.md)
- **検索語**: *.refresh
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/commands/install/archive/inspection/analyzer/resource_resolver.rs` および `postprocess.rs` において `*.refresh`（`balloon.refresh`, `ghost0.refresh` 等）の解析およびリフレッシュクリーンアップ処理が完全実装済み。

## 実装箇所

- `src-tauri/src/commands/install/archive/inspection/analyzer/resource_resolver.rs` (`.refresh`)
- `src-tauri/src/commands/install/archive/postprocess.rs` (`perform_refresh_cleanup`)
