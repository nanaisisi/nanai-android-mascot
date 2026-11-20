# mousecursor.arrow,ファイル名

- **規格**: [mousecursor.arrow.md](../../../../../ukadoc-spec/descript/shell/descript-txt/mousecursor.arrow.md)
- **検索語**: mousecursor.arrow
- **対応状況**: ✅ 実装済

## 突合結果

未確認・未実装。


## 実装箇所

- `src-tauri/src/shiori/property/tests.rs:98` `evaluate_property_query("currentghost.balloon.mousecursor.arrow"),`
- `ui/ts/core/actions/balloon-descript/assets.ts:401` `// [mousecursor.arrow,ファイル名]:`
- `tests/balloon-descript/all-properties/mock-props.ts:89` `"mousecursor.arrow": "cursor.cur",`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:14` `"currentghost.balloon.mousecursor.arrow" => "",`
- `ui/ts/core/actions/balloon-descript/assets.ts:402` `setMouseCursor("mousecursor.arrow", "--balloon-cursor-arrow");`
- `tests/core-coverage-boost/balloon-descript-coverage.test.ts:139` `"mousecursor.arrow": "cur_arrow.png",`
