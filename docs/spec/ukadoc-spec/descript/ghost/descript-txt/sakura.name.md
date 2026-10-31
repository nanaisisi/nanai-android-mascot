# sakura.name,名前

- **規格**: [sakura.name.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/sakura.name.md)
- **検索語**: sakura.name
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `sakura.name` キーをパースし、本体（\0）表示名 `GhostInfo.sakura_name` へ設定する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive.rs:295` `.and_then(|m| m.get("sakura.name").cloned());`
- `src-tauri/src/ghost/scan/shell.rs:91` `// [sakura.name,名前], [sakura.name2,名前], [kero.name,名前], [char*.name,名前]:`
- `src-tauri/src/ghost/scan/shell.rs:108` `let _m_sakura_name = merged.get("sakura.name");`
- `src-tauri/src/ghost/scan/directory/manifest.rs:39` `m.get("sakura.name")`
- `src-tauri/src/ghost/scan/directory/manifest.rs:41` `.or_else(|| m.get("sakura.name2").cloned())`
