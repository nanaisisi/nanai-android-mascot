# refreshundeletemask,ファイル名1:ファイル名2...

- **規格**: [refreshundeletemask.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/refreshundeletemask.md)
- **検索語**: refreshundeletemask
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/commands/install/archive/inspection/analyzer/resource_resolver.rs` および `postprocess.rs` において `refreshundeletemask`（リフレッシュインストール時の削除保護ファイル・マスク）のパースおよびクリーンアップ除外処理が完全実装済み。

## 実装箇所

- `src-tauri/src/commands/install/archive/inspection/analyzer/resource_resolver.rs` (`refreshundeletemask`)
- `src-tauri/src/commands/install/archive/postprocess.rs` (`perform_refresh_cleanup`)
