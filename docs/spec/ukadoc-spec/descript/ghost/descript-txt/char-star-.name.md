# char*.name,名前

- **規格**: [char-star-.name.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/char-star-.name.md)
- **検索語**: char*.name
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/directory/manifest/parser.rs` および `crates/nanai-core/src/descript_parser/types.rs` (`char_name(index)`) において `char*.name` キー群をパース・取得する実装が完全に行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:37` `.is_some_and(|m| m.contains_key("kero.name") || m.contains_key("char1.name"));`
- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:99` `// char0.defaultx char0.defaulty char0.defaultleft char0.defaulttop char0.balloo`
