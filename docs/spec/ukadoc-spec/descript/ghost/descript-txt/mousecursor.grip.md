# mousecursor.grip,ファイル名

- **規格**: [mousecursor.grip.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/mousecursor.grip/) (ukadoc-spec/descript/ghost/descript-txt/mousecursor.grip.md)
- **検索語**: mousecursor.grip
- **対応状況**: ✅ 実装済

## 突合結果

`ui/ts/core/actions/balloon-descript/assets.ts` の `setMouseCursor()` において `mousecursor.grip` をパースし、`--balloon-cursor-grip` カスタムプロパティおよび CSS `cursor` スタイリングへ反映する実装が完全に行われている。

## 実装箇所

- `src-tauri/src/shiori/property/evaluator/static_rules.rs` (`currentghost.balloon.mousecursor.grip`)
- `ui/ts/core/actions/balloon-descript/assets.ts` (`mousecursor.grip`)
