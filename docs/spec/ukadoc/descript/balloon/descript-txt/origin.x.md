# origin.x,座標 [\*1](../index.md#balloon設定)

- **規格**: [origin.x.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/descript-txt/origin.x/) (ukadoc-spec/descript/balloon/descript-txt/origin.x.md)
- **検索語**: origin.x
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「origin.x」が出現。実際の処理内容は未精査。

## 実装箇所

- `ui/js/core/app-actions.js:182` (コメント) `// バルーン原点 (origin.x, origin.y) によるオフセット調整`
- `ui/js/core/app-actions.js:183`  `const ox = parseInt(props["origin.x"], 10);`
- `crates/ui/src/descript.rs:50` (コメント) `/// バルーン用原点座標 (origin.x, origin.y)`
- `crates/ui/src/descript.rs:52`  `let x = self.get("origin.x").and_then(|v| v.parse().ok());`
