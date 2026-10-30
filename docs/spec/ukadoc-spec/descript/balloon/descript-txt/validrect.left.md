# validrect.left,座標

- **規格**: [validrect.left.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/validrect.left.md)
- **検索語**: validrect.left
- **対応状況**: ✅ 対応済

## 突合結果

`app-actions.js` の `applyBalloonDescript()` において `validrect.left, top, right, bottom` を一括パースし、ドキュメント内の `.balloon` 要素の `padding`（`${padTop} ${padRight} ${padBottom} ${padLeft}`）として動的適用される実装が行われている。

## 実装箇所

- `crates/ui/src/descript/parser.rs:77` `/// バルーン有効テキスト領域 (validrect.left, top, right, bottom)`
- `crates/ui/src/descript/parser.rs:79` `let l = self.get("validrect.left").and_then(|v| v.parse().ok());`
- `crates/ui/src/descript/tests.rs:60` `validrect.left,0\n\`
- `ui/js/core/actions/balloon-descript/layout.js:83` `// [validrect.left,座標], [validrect.top,座標], [validrect.right,座標], [validrect.bot`
- `ui/js/core/actions/balloon-descript/layout.js:84` `const vl = parseInt(props["validrect.left"], 10);`
