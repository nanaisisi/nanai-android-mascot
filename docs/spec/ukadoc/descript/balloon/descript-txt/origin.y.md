# origin.y,座標 [\*1](../index.md#balloon設定)

- **規格**: [origin.y.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/descript-txt/origin.y/) (ukadoc-spec/descript/balloon/descript-txt/origin.y.md)
- **検索語**: origin.y
- **対応状況**: ⚠️ 一部対応(読込のみ)

## 突合結果

ghost/scan.rs 等で descript の値を読込している。表示・動作への反映は個別未確認。

## 実装箇所

- `ui/js/core/app-actions.js:182` (コメント) `// バルーン原点 (origin.x, origin.y) によるオフセット調整`
- `ui/js/core/app-actions.js:184`  `const oy = parseInt(props["origin.y"], 10);`
- `crates/ui/src/descript.rs:50` (コメント) `/// バルーン用原点座標 (origin.x, origin.y)`
- `crates/ui/src/descript.rs:53`  `let y = self.get("origin.y").and_then(|v| v.parse().ok());`
