# readme.charset,文字コード

- **規格**: [readme.charset.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/readme.charset.md)
- **検索語**: readme.charset
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/assets.js` の `applyAssetProperties()` において `props["readme.charset"]` を検出し、`--balloon-readme-charset` カスタムプロパティへバインドする実装が行われている。

## 実装箇所

- `src-tauri/src/commands/ext.rs:47` `// [readme,ファイル名], [readme.charset,文字コード], [charset,文字コード], [secondchangeinterva`
- `src-tauri/src/commands/ext.rs:49` `let _readme_cs = map.get("readme.charset");`
- `src-tauri/src/commands/ext.rs:116` `// [readme,ファイル名], [readme.charset,文字コード], [charset,文字コード], [alwaysdisplay,数値], `
- `src-tauri/src/commands/ext.rs:118` `let _readme_cs = map.get("readme.charset");`
- `src-tauri/src/ghost/scan/shell.rs:83` `// [name,シェル名], [type,種別], [id,ID名], [charset,文字コード], [craftman,作者名], [craftmanw`
