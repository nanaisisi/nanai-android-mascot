# origin.y,座標 [\*1](../index.md#balloon設定)

- **規格**: [origin.y.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/descript-txt/origin.y/) (ukadoc-spec/descript/balloon/descript-txt/origin.y.md)
- **検索語**: origin.y
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「origin.y」が出現。実際の処理内容は未精査。

## 実装箇所

- `ui/js/core/app-actions.js:182` (コメント) `// バルーン原点 (origin.x, origin.y) によるオフセット調整`
- `ui/js/core/app-actions.js:184`  `const oy = parseInt(props["origin.y"], 10);`
- `crates/ui/src/descript.rs:50` (コメント) `/// バルーン用原点座標 (origin.x, origin.y)`
- `crates/ui/src/descript.rs:53`  `let y = self.get("origin.y").and_then(|v| v.parse().ok());`
