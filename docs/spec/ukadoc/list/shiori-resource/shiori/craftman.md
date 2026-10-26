# craftman

- **規格**: [craftman.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-resource/shiori/craftman/) (ukadoc-spec/list/shiori-resource/shiori/craftman.md)
- **検索語**: craftman
- **対応状況**: ⚠️ 一部対応(読込のみ)

## 突合結果

ghost/scan.rs で craftman / craftmanurl を読込。

## 実装箇所

- `src-tauri/src/ghost/scan.rs:194` `let craftman = meta_map.as_ref().and_then(|m| m.get("craftman").cloned());`
- `src-tauri/src/ghost/scan.rs:195` `let craftman_url = meta_map`
- `src-tauri/src/ghost/scan.rs:197` `.and_then(|m| m.get("craftmanurl").cloned());`
- `src-tauri/src/ghost/scan.rs:208` `craftman,`
- `src-tauri/src/ghost/scan.rs:209` `craftman_url,`
