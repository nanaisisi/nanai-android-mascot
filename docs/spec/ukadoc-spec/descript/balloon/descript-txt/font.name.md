# font.name,フォント名

- **規格**: [font.name.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.name.md)
- **検索語**: font.name
- **対応状況**: ✅ 実装済

## 突合結果

`app-actions.js` の `applyBalloonDescript()` において `props["font.name"]` を取得し、文書のルート要素に対して `--balloon-font-family: \`"${props["font.name"]}", Meiryo, sans-serif\`` カスタムプロパティとして動的バインドされる実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/shell/theme.rs:39` `let font_name = merged.get("menu.font.name").cloned();`
- `src-tauri/src/shiori/property/tests.rs:125` `assert_eq!(evaluate_property_query("menu.font.name"), "sans-serif");`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:75` `"menu.font.name" => "sans-serif",`
- `ui/ts/core/actions/balloon-descript/font/base.ts:9` `if (props["font.name"]) {`
- `ui/ts/core/actions/balloon-descript/font/base.ts:12` ``"${props["font.name"]}", Meiryo, sans-serif`,`
