# mousecursor.text,ファイル名

- **規格**: [mousecursor.text.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/mousecursor.text/) (ukadoc-spec/descript/ghost/descript-txt/mousecursor.text.md)
- **検索語**: mousecursor.text
- **対応状況**: ⚠️ 一部対応

## 突合結果

`ui/ts/core/actions/balloon-descript/assets.ts` の `setMouseCursor()` において `mousecursor.text` をパースし、`--balloon-cursor-text` カスタムプロパティおよび CSS `cursor` スタイリングへ反映する実装が完全に行われている。

## 実装箇所

- `src-tauri/src/shiori/property/evaluator/static_rules.rs:15` `"currentghost.balloon.mousecursor.text" => "",`
- `ui/ts/core/actions/balloon-descript/assets.ts:375` `// [mousecursor.text,ファイル名]:`
- `ui/ts/core/actions/balloon-descript/assets.ts:376` `setMouseCursor("mousecursor.text", "--balloon-cursor-text");`
