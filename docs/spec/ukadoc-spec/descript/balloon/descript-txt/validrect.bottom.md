# validrect.bottom,座標 [\*1](../index.md#balloon設定)

- **規格**: [validrect.bottom.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/validrect.bottom.md)
- **検索語**: validrect.bottom
- **対応状況**: ⚠️ 一部対応(読込のみ)

## 突合結果

ghost/scan.rs 等で descript の値を読込している。表示・動作への反映は個別未確認。

## 実装箇所

- `crates/ui/src/descript.rs:116` `let b = self.get("validrect.bottom").and_then(|v| v.parse().ok());`
- `ui/js/ghost/balloon-window.js:108` `const vb = parseInt(props["validrect.bottom"], 10);`
- `ui/js/core/actions/balloon-descript.js:142` `const vb = parseInt(props["validrect.bottom"], 10);`
