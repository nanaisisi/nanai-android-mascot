# origin.y,座標

- **規格**: [origin.y.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/origin.y.md)
- **検索語**: origin.y
- **対応状況**: ✅ 実装済

## 突合結果

`app-actions.js` の `applyBalloonDescript()` において原点 Y オフセットとして動的適用対応済。

## 実装箇所

- `crates/ui/src/descript/tests.rs:59` `origin.y,20\n\`
- `crates/ui/src/descript/parser/queries.rs:29` `/// バルーン用原点座標 (origin.x, origin.y)`
- `crates/ui/src/descript/parser/queries.rs:32` `let y = self.get("origin.y").and_then(|v| v.parse().ok());`
- `ui/ts/core/tauri-helper.ts:169` `new PhysicalPosition(Math.round(origin.x + x), Math.round(origin.y + y)),`
- `ui/ts/core/actions/balloon-descript/layout/position.ts:11` `// [origin.x,座標], [origin.y,座標]:`
