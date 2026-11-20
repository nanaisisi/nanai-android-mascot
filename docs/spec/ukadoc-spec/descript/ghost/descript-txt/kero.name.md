# kero.name,名前

- **規格**: [kero.name.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/kero.name.md)
- **検索語**: kero.name
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/directory/manifest/parser.rs` および `crates/nanai-core/src/descript_parser/types.rs` において相方（\1）表示名 `kero.name` のパースおよび `GhostInfo.kero_name` へのバインドが完全実装済み。

## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs:61` `/// ケロ側キャラクター名 (`kero.name`)`
- `src-tauri/src/commands/install/archive/postprocess.rs:118` `let kero_name = meta_map.as_ref().and_then(|m| m.get("kero.name").cloned());`
- `crates/nanai-core/src/descript_parser/types.rs:63` `self.get("kero.name")`
- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:33` `let kero_name = meta_map.as_ref().and_then(|m| m.get("kero.name").cloned());`
- `crates/ui/src/descript/tests.rs:55` `kero.name,Kero\n\`
- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:37` `.is_some_and(|m| m.contains_key("kero.name") || m.contains_key("char1.name"));`
