# origin.x,座標 [\*1](../index.md#balloon設定)

- **規格**: [origin.x.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/descript-txt/origin.x/) (ukadoc-spec/descript/balloon/descript-txt/origin.x.md)
- **検索語**: origin.x
- **対応状況**: ⚠️ 一部対応(読込のみ)

## 突合結果

ghost/scan.rs 等で descript の値を読込している。表示・動作への反映は個別未確認。

## 実装箇所

- `ui/js/core/app-actions.js:182` (コメント) `// バルーン原点 (origin.x, origin.y) によるオフセット調整`
- `ui/js/core/app-actions.js:183`  `const ox = parseInt(props["origin.x"], 10);`
- `crates/ui/src/descript.rs:50` (コメント) `/// バルーン用原点座標 (origin.x, origin.y)`
- `crates/ui/src/descript.rs:52`  `let x = self.get("origin.x").and_then(|v| v.parse().ok());`
