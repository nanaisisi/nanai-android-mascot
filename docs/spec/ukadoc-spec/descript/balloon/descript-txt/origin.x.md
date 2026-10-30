# origin.x,座標

- **規格**: [origin.x.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/origin.x.md)
- **検索語**: origin.x
- **対応状況**: ✅ 対応済

## 突合結果

`app-actions.js` の `applyBalloonDescript()` において原点 X オフセットとして動的適用対応済。


## 実装箇所

- `crates/ui/src/descript/parser.rs:70` `/// バルーン用原点座標 (origin.x, origin.y)`
- `crates/ui/src/descript/parser.rs:72` `let x = self.get("origin.x").and_then(|v| v.parse().ok());`
- `crates/ui/src/descript/tests.rs:58` `origin.x,10\n\`
- `ui/js/core/tauri-helper.js:157` `new PhysicalPosition(Math.round(origin.x + x), Math.round(origin.y + y)),`
- `ui/js/core/actions/balloon-descript/layout.js:123` `// [origin.x,座標], [origin.y,座標]:`
