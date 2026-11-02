# shiori.version,バージョン

- **規格**: [shiori.version.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/shiori.version.md)
- **検索語**: shiori.version
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `shiori.version` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory/manifest.rs:82` `let shiori_version = meta_map.as_ref().and_then(|m| m.get("shiori.version").clon`
