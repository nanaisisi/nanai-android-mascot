# kero.name,名前

- **規格**: [kero.name.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/kero.name/) (ukadoc-spec/descript/shell/descript-txt/kero.name.md)
- **検索語**: kero.name
- **対応状況**: ⚠️ 一部対応

## 突合結果

ghost/scan.rs 等で descript の値を読込している。表示・動作への反映は個別未確認。

## 実装箇所

- `src-tauri/src/commands/install/archive/postprocess.rs:101` `let kero_name = meta_map.as_ref().and_then(|m| m.get("kero.name").cloned());`
- `src-tauri/src/ghost/scan/directory/manifest.rs:63` `let kero_name = meta_map.as_ref().and_then(|m| m.get("kero.name").cloned());`
- `src-tauri/src/ghost/scan/directory/manifest.rs:67` `.is_some_and(|m| m.contains_key("kero.name") || m.contains_key("char1.name"));`
- `crates/ui/src/descript/tests.rs:55` `kero.name,Kero\n\`
- `crates/ui/src/descript/parser/queries.rs:14` `/// キャラクター本体名（`kero.name`または`sakura.name`）`
