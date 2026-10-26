# validrect.bottom,座標 [\*1](../index.md#balloon設定)

- **規格**: [validrect.bottom.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/descript-txt/validrect.bottom/) (ukadoc-spec/descript/balloon/descript-txt/validrect.bottom.md)
- **検索語**: validrect.bottom
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「validrect.bottom」が出現。実際の処理内容は未精査。

## 実装箇所

- `ui/js/core/app-actions.js:165`  `const vb = parseInt(props["validrect.bottom"], 10);`
- `crates/ui/src/descript.rs:62`  `let b = self.get("validrect.bottom").and_then(|v| v.parse().ok());`
