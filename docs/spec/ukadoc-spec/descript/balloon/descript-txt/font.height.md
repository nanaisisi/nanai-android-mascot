# font.height,数値

- **規格**: [font.height.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.height.md)
- **検索語**: font.height
- **対応状況**: ⚠️ 一部対応

## 突合結果

`app-actions.js` の `applyBalloonDescript()` において `props["font.height"]` をパースし、文書のルート要素に対して `--balloon-font-size: \`${fh}px\`` カスタムプロパティとして動的バインドされる実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/shell/theme.rs:40` `let font_height = merged.get("menu.font.height").cloned();`
- `src-tauri/src/shiori/property/tests.rs:126` `assert_eq!(evaluate_property_query("menu.font.height"), "12");`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:76` `"menu.font.height" => "12",`
- `crates/nanai-core/src/descript_parser.rs:121` `/// バルーンフォントサイズ (`font.height`)`
- `crates/nanai-core/src/descript_parser.rs:123` `self.get("font.height").and_then(|v| v.parse::<i32>().ok())`
