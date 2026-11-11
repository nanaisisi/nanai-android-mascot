# charset,文字コード

- **規格**: [charset.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/file/charset/) (ukadoc-spec/descript/shell-surfaces/file/charset.md)
- **検索語**: charset
- **対応状況**: ⚠️ 一部対応

## 突合結果

`ui/js/surface/surface-load.js` の `loadSurfacesTxt` において `surfaces.txt` ファイルのエンコーディング・文字コード定義をパース・解決する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/ext.rs:49` `let _readme_cs = map.get("readme.charset");`
- `src-tauri/src/commands/ext.rs:50` `let _cs = map.get("charset");`
- `src-tauri/src/commands/ext.rs:118` `let _readme_cs = map.get("readme.charset");`
- `src-tauri/src/commands/ext.rs:119` `let _cs = map.get("charset");`
- `src-tauri/src/commands/install/utils.rs:22` `if lower.contains("charset,shift_jis") || lower.contains("charset,sjis") {`
