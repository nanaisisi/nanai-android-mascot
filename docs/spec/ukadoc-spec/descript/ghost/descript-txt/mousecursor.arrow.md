# mousecursor.arrow,ファイル名

- **規格**: [mousecursor.arrow.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/mousecursor.arrow/) (ukadoc-spec/descript/ghost/descript-txt/mousecursor.arrow.md)
- **検索語**: mousecursor.arrow
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` および `ui/js/core/actions/balloon-descript/assets.js` の `setMouseCursor()` において `mousecursor.arrow` を検出し、`--balloon-cursor-arrow` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `src-tauri/src/shiori/property/tests.rs:71` `evaluate_property_query("currentghost.balloon.mousecursor.arrow"),`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:14` `"currentghost.balloon.mousecursor.arrow" => "arrow.cur",`
- `ui/ts/core/actions/balloon-descript/assets.ts:194` `// [mousecursor.arrow,ファイル名]:`
- `ui/ts/core/actions/balloon-descript/assets.ts:195` `setMouseCursor("mousecursor.arrow", "--balloon-cursor-arrow");`
- `tests/balloon-descript/all-properties/mock-props.ts:89` `"mousecursor.arrow": "cursor.cur",`
