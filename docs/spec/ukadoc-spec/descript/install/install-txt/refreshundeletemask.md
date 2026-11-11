# refreshundeletemask,ファイル名1:ファイル名2...

- **規格**: [refreshundeletemask.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/refreshundeletemask.md)
- **検索語**: refreshundeletemask
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `refreshundeletemask` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive/inspection/tests.rs:12` `"balloon.refreshundeletemask".to_string(),`
- `src-tauri/src/commands/install/archive/inspection/tests.rs:68` `"refreshundeletemask".to_string(),`
- `src-tauri/src/commands/install/archive/inspection/tests.rs:82` `.get("refreshundeletemask")`
- `src-tauri/src/commands/install/archive/inspection/analyzer/resource_resolver.rs:30` `.get(&format!("{r_type}.refreshundeletemask"))`
- `src-tauri/src/commands/install/archive/inspection/analyzer/resource_resolver.rs:59` `.get(&format!("{r_type}{idx}.refreshundeletemask"))`
