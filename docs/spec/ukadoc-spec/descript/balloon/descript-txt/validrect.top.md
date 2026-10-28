# validrect.top,座標 [\*1](../index.md#balloon設定)

- **規格**: [validrect.top.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/validrect.top.md)
- **検索語**: validrect.top
- **対応状況**: ⚠️ 一部対応(読込のみ)

## 突合結果

ghost/scan.rs 等で descript の値を読込している。表示・動作への反映は個別未確認。

## 実装箇所

- `ui/js/core/app-actions.js:163` `const vt = parseInt(props["validrect.top"], 10);`
- `crates/ui/src/descript.rs:60` `let t = self.get("validrect.top").and_then(|v| v.parse().ok());`
