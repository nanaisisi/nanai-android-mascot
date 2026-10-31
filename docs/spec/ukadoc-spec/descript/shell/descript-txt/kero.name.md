# kero.name,名前

- **規格**: [kero.name.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/kero.name/) (ukadoc-spec/descript/shell/descript-txt/kero.name.md)
- **検索語**: kero.name
- **対応状況**: ⚠️ 一部対応(読込のみ)

## 突合結果

ghost/scan.rs 等で descript の値を読込している。表示・動作への反映は個別未確認。

## 実装箇所

- `src-tauri/src/commands/install/archive.rs:296` `let kero_name = meta_map.as_ref().and_then(|m| m.get("kero.name").cloned());`
- `src-tauri/src/ghost/scan/shell.rs:91` `// [sakura.name,名前], [sakura.name2,名前], [kero.name,名前], [char*.name,名前]:`
- `src-tauri/src/ghost/scan/shell.rs:109` `let _m_kero_name = merged.get("kero.name");`
- `src-tauri/src/ghost/scan/directory/manifest.rs:43` `let kero_name = meta_map.as_ref().and_then(|m| m.get("kero.name").cloned());`
- `crates/ui/src/lib.rs:49` `let sample = "charset,Shift_JIS\r\nname,SampleGhost\r\nsakura.name,Nanai\r\nkero`
