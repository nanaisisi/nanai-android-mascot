# mousecursor.arrow,ファイル名

- **規格**: [mousecursor.arrow.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/mousecursor.arrow/) (ukadoc-spec/descript/ghost/descript-txt/mousecursor.arrow.md)
- **検索語**: mousecursor.arrow
- **対応状況**: ✅ 実装済

## 突合結果

`ui/ts/core/actions/balloon-descript/assets.ts` の `setMouseCursor()` において `mousecursor.arrow` をパースし、`--balloon-cursor-arrow` カスタムプロパティおよび CSS `cursor` スタイリングへ反映する実装が完全に行われている。

## 実装箇所

- `src-tauri/src/shiori/property/evaluator/static_rules.rs` (`currentghost.balloon.mousecursor.arrow`)
- `ui/ts/core/actions/balloon-descript/assets.ts` (`mousecursor.arrow`)
