# mousecursor.hand,ファイル名

- **規格**: [mousecursor.hand.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/mousecursor.hand/) (ukadoc-spec/descript/ghost/descript-txt/mousecursor.hand.md)
- **検索語**: mousecursor.hand
- **対応状況**: ⚠️ 一部対応

## 突合結果

`ui/ts/core/actions/balloon-descript/assets.ts` の `setMouseCursor()` において `mousecursor.hand` をパースし、`--balloon-cursor-hand` カスタムプロパティおよび CSS `cursor` スタイリングへ反映する実装が完全に行われている。

## 実装箇所

- `src-tauri/src/shiori/property/evaluator/static_rules.rs:18` `"currentghost.balloon.mousecursor.hand" => "",`
- `ui/ts/core/actions/balloon-descript/assets.ts:381` `// [mousecursor.hand,ファイル名]:`
- `ui/ts/core/actions/balloon-descript/assets.ts:382` `setMouseCursor("mousecursor.hand", "--balloon-cursor-hand");`
