# font.color.r,数値

- **規格**: [font.color.r.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/descript-txt/font.color.r/) (ukadoc-spec/descript/balloon/descript-txt/font.color.r.md)
- **検索語**: font.color.r
- **対応状況**: ⚠️ 一部対応(読込のみ)

## 突合結果

ghost/scan.rs 等で descript の値を読込している。表示・動作への反映は個別未確認。

## 実装箇所

- `ui/js/core/app-actions.js:147` (コメント) `// フォント色 (font.color.r,g,b または font.color)`
- `ui/js/core/app-actions.js:151`  `props["font.color.r"] &&`
- `ui/js/core/app-actions.js:157`  `rgb(${props["font.color.r"]}, ${props["font.color.g"]}, ${props["font.color.b"]}),`
- `crates/ui/src/descript.rs:66` (コメント) `/// バルーンフォント色 (font.color.r,g,b または font.color)`
