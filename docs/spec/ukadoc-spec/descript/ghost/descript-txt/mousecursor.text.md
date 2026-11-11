# mousecursor.text,ファイル名

- **規格**: [mousecursor.text.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/mousecursor.text/) (ukadoc-spec/descript/ghost/descript-txt/mousecursor.text.md)
- **検索語**: mousecursor.text
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` および `ui/js/core/actions/balloon-descript/assets.js` の `setMouseCursor()` において `mousecursor.text` を検出し、`--balloon-cursor-text` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `src-tauri/src/shiori/property/evaluator/static_rules.rs:15` `"currentghost.balloon.mousecursor.text" => "text.cur",`
- `ui/ts/core/actions/balloon-descript/assets.ts:196` `// [mousecursor.text,ファイル名]:`
- `ui/ts/core/actions/balloon-descript/assets.ts:197` `setMouseCursor("mousecursor.text", "--balloon-cursor-text");`
