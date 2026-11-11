# refresh,数値

- **規格**: [refresh.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/refresh.md)
- **検索語**: refresh
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `refresh` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive/mod.rs:36` `if inspection.refresh {`
- `src-tauri/src/commands/install/archive/mod.rs:38` `"🧹 Performing refresh cleanup on target_dir: {:?} (masks: {:?})",`
- `src-tauri/src/commands/install/archive/mod.rs:46` `if res_target.refresh && res_target.destination_dir.exists() {`
- `src-tauri/src/commands/install/archive/mod.rs:48` `"🧹 Performing refresh cleanup on bundled resource dir: {:?} (masks: {:?})",`
- `src-tauri/src/commands/install/archive/inspection/tests.rs:10` `map.insert("balloon.refresh".to_string(), "1".to_string());`
