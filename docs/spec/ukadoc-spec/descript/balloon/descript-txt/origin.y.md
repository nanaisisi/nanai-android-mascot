# origin.y,座標

- **規格**: [origin.y.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/origin.y.md)
- **検索語**: origin.y
- **対応状況**: ✅ 対応済

## 突合結果

`app-actions.js` の `applyBalloonDescript()` において原点 Y オフセットとして動的適用対応済。


## 実装箇所

- `crates/ui/src/descript.rs:104` `/// バルーン用原点座標 (origin.x, origin.y)`
- `crates/ui/src/descript.rs:107` `let y = self.get("origin.y").and_then(|v| v.parse().ok());`
- `ui/js/core/tauri-helper.js:157` `new PhysicalPosition(Math.round(origin.x + x), Math.round(origin.y + y)),`
- `ui/js/core/actions/balloon-descript.js:170` `const oy = parseInt(props["origin.y"], 10);`
