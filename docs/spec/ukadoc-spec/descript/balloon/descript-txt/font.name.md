# font.name,フォント名

- **規格**: [font.name.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.name.md)
- **検索語**: font.name
- **対応状況**: ✅ 実装済

## 突合結果

`app-actions.js` の `applyBalloonDescript()` において `props["font.name"]` を取得し、文書のルート要素に対して `--balloon-font-family: \`"${props["font.name"]}", Meiryo, sans-serif\`` カスタムプロパティとして動的バインドされる実装が行われている。

## 実装箇所

- `crates/nanai-core/src/descript_parser.rs:116` `/// バルーンフォント名 (`font.name`)`
- `src-tauri/src/ghost/scan/shell/theme.rs:39` `let font_name = merged.get("menu.font.name").cloned();`
- `ui/ts/core/actions/balloon-descript/font/base.ts:9` `if (props["font.name"]) {`
- `ui/ts/ui/spec-compliance-runner.ts:393` `"font.name / font.height / arrow.filename / recommended.ghost";`
- `tests/core-actions.test.ts:33` `"font.name": "Arial",`
- `crates/nanai-core/src/descript_parser.rs:118` `self.get("font.name")`
