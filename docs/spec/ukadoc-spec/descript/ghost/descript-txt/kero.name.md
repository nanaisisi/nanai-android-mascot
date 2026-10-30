# kero.name,名前

- **規格**: [kero.name.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/kero.name.md)
- **検索語**: kero.name
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `kero.name` キーをパースし、相方（\1）表示名 `GhostInfo.kero_name` へ設定する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive.rs:282` `let kero_name = meta_map.as_ref().and_then(|m| m.get("kero.name").cloned());`
- `src-tauri/src/ghost/scan/directory.rs:99` `// [version,バージョン], [sakura.name,名前], [sakura.name2,名前], [kero.name,名前], [char*.`
- `src-tauri/src/ghost/scan/directory.rs:106` `.and_then(|m| m.get("kero.name").cloned());`
- `src-tauri/src/ghost/scan/shell.rs:91` `// [sakura.name,名前], [sakura.name2,名前], [kero.name,名前], [char*.name,名前]:`
- `src-tauri/src/ghost/scan/shell.rs:109` `let _m_kero_name = merged.get("kero.name");`
