# validrect.right,座標 [\*1](../index.md#balloon設定)

- **規格**: [validrect.right.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/descript-txt/validrect.right/) (ukadoc-spec/descript/balloon/descript-txt/validrect.right.md)
- **検索語**: validrect.right
- **対応状況**: ⚠️ 一部対応(読込のみ)

## 突合結果

ghost/scan.rs 等で descript の値を読込している。表示・動作への反映は個別未確認。

## 実装箇所

- `ui/js/core/app-actions.js:164`  `const vr = parseInt(props["validrect.right"], 10);`
- `crates/ui/src/descript.rs:61`  `let r = self.get("validrect.right").and_then(|v| v.parse().ok());`
