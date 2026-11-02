# shiori.logo.file,ファイル名

- **規格**: [shiori.logo.file.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/shiori.logo.file.md)
- **検索語**: shiori.logo.file
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `shiori.logo.file` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory/manifest.rs:91` `let shiori_logo_file = meta_map.as_ref().and_then(|m| m.get("shiori.logo.file").`
