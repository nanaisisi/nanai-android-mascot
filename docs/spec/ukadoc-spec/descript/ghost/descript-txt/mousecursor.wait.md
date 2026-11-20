# mousecursor.wait,ファイル名

- **規格**: [mousecursor.wait.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/mousecursor.wait/) (ukadoc-spec/descript/ghost/descript-txt/mousecursor.wait.md)
- **検索語**: mousecursor.wait
- **対応状況**: ⚠️ 一部対応

## 突合結果

`ui/ts/core/actions/balloon-descript/assets.ts` の `setMouseCursor()` において `mousecursor.wait` をパースし、`--balloon-cursor-wait` カスタムプロパティおよび CSS `cursor` スタイリングへ反映する実装が完全に行われている。

## 実装箇所

- `src-tauri/src/shiori/property/evaluator/static_rules.rs:16` `"currentghost.balloon.mousecursor.wait" => "",`
- `ui/ts/core/actions/balloon-descript/assets.ts:377` `// [mousecursor.wait,ファイル名]:`
- `ui/ts/core/actions/balloon-descript/assets.ts:378` `setMouseCursor("mousecursor.wait", "--balloon-cursor-wait");`
