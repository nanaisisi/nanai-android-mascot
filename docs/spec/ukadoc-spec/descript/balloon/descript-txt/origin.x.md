# origin.x,座標

- **規格**: [origin.x.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/origin.x.md)
- **検索語**: origin.x
- **対応状況**: ✅ 実装済

## 突合結果

`app-actions.js` の `applyBalloonDescript()` において原点 X オフセットとして動的適用対応済。

## 実装箇所

- `crates/ui/src/descript/tests.rs:58` `origin.x,10\n\`
- `crates/ui/src/descript/parser/queries.rs:29` `/// バルーン用原点座標 (origin.x, origin.y)`
- `crates/ui/src/descript/parser/queries.rs:31` `let x = self.get("origin.x").and_then(|v| v.parse().ok());`
- `ui/ts/core/tauri-helper.ts:169` `new PhysicalPosition(Math.round(origin.x + x), Math.round(origin.y + y)),`
- `ui/ts/core/actions/balloon-descript/layout/position.ts:11` `// [origin.x,座標], [origin.y,座標]:`
