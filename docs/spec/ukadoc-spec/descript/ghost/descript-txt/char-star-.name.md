# char*.name,名前

- **規格**: [char-star-.name.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/char-star-.name.md)
- **検索語**: char*.name
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `char*.name` キー群をパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory/manifest.rs:67` `.is_some_and(|m| m.contains_key("kero.name") || m.contains_key("char1.name"));`
