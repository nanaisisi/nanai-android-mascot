# validrect.left,座標 [\*1](../index.md#balloon設定)

- **規格**: [validrect.left.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/descript-txt/validrect.left/) (ukadoc-spec/descript/balloon/descript-txt/validrect.left.md)
- **検索語**: validrect.left
- **対応状況**: ⚠️ 一部対応(読込のみ)

## 突合結果

ghost/scan.rs 等で descript の値を読込している。表示・動作への反映は個別未確認。

## 実装箇所

- `ui/js/core/app-actions.js:161` (コメント) `// 有効テキスト領域 (validrect.left, top, right, bottom) によるパディング調整`
- `ui/js/core/app-actions.js:162` `const vl = parseInt(props["validrect.left"], 10);`
- `crates/ui/src/descript.rs:57` (コメント) `/// バルーン有効テキスト領域 (validrect.left, top, right, bottom)`
- `crates/ui/src/descript.rs:59` `let l = self.get("validrect.left").and_then(|v| v.parse().ok());`
