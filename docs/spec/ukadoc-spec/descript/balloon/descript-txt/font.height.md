# font.height,数値

- **規格**: [font.height.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.height.md)
- **検索語**: font.height
- **対応状況**: ✅ 実装済

## 突合結果

`app-actions.js` の `applyBalloonDescript()` において `props["font.height"]` をパースし、文書のルート要素に対して `--balloon-font-size: \`${fh}px\`` カスタムプロパティとして動的バインドされる実装が行われている。

## 実装箇所

- `crates/nanai-core/src/descript_parser.rs:121` `/// バルーンフォントサイズ (`font.height`)`
- `src-tauri/src/ghost/scan/shell/theme.rs:40` `let font_height = merged.get("menu.font.height").cloned();`
- `ui/ts/core/actions/balloon-descript/font/base.ts:16` `if (props["font.height"]) {`
- `ui/ts/ui/spec-compliance-runner.ts:393` `"font.name / font.height / arrow.filename / recommended.ghost";`
- `tests/core-actions.test.ts:34` `"font.height": "12",`
- `crates/nanai-core/src/descript_parser.rs:123` `self.get("font.height").and_then(|v| v.parse::<i32>().ok())`
