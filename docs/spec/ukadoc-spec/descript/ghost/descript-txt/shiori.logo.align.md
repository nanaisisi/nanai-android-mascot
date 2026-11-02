# shiori.logo.align,位置情報

- **規格**: [shiori.logo.align.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/shiori.logo.align.md)
- **検索語**: shiori.logo.align
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `shiori.logo.align` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory/manifest.rs:94` `.and_then(|m| m.get("shiori.logo.align").cloned());`
