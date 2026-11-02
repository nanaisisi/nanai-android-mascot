# refreshundeletemask,ファイル名1:ファイル名2...

- **規格**: [refreshundeletemask.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/refreshundeletemask.md)
- **検索語**: refreshundeletemask
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `refreshundeletemask` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive/inspection.rs:29` `/// 無印 → 0 → 1 → 2... の順に連続探索し、欠番が出た時点で打ち切る (refresh / refreshundeletemask 拡張対応)`
- `src-tauri/src/commands/install/archive/inspection.rs:45` `// 1. 無印 (例: balloon.directory, balloon.refresh, balloon.refreshundeletemask)`
- `src-tauri/src/commands/install/archive/inspection.rs:54` `.get(&format!("{r_type}.refreshundeletemask"))`
- `src-tauri/src/commands/install/archive/inspection.rs:83` `.get(&format!("{r_type}{idx}.refreshundeletemask"))`
- `src-tauri/src/commands/install/archive/inspection.rs:178` `if let Some(val) = map.get("refreshundeletemask") {`
