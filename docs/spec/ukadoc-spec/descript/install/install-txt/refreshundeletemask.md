# refreshundeletemask,ファイル名1:ファイル名2...

- **規格**: [refreshundeletemask.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/refreshundeletemask.md)
- **検索語**: refreshundeletemask
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/commands/install/archive/inspection/analyzer/resource_resolver.rs` および `postprocess.rs` において `refreshundeletemask`（リフレッシュインストール時の削除保護ファイル・マスク）のパースおよびクリーンアップ除外処理が完全実装済み。

## 実装箇所

- `crates/ui/src/update/parser/install_manifest.rs:49` `.get("refreshundeletemask")`
- `src-tauri/src/commands/install/archive/inspection/tests.rs:12` `"balloon.refreshundeletemask".to_string(),`
- `crates/ui/src/update/parser/install_manifest.rs:80` `.get(&format!("{r_type}.refreshundeletemask"))`
- `src-tauri/src/commands/install/archive/inspection/tests.rs:68` `"refreshundeletemask".to_string(),`
- `crates/ui/src/update/parser/install_manifest.rs:109` `.get(&format!("{r_type}{idx}.refreshundeletemask"))`
- `src-tauri/src/commands/install/archive/inspection/tests.rs:82` `.get("refreshundeletemask")`
