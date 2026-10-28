# font.color.b,数値

- **規格**: [font.color.b.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.color.b.md)
- **検索語**: font.color.b
- **対応状況**: ⚠️ 一部対応(読込のみ)

## 突合結果

ghost/scan.rs 等で descript の値を読込している。表示・動作への反映は個別未確認。

## 実装箇所

- `ui/js/core/app-actions.js:153` `props["font.color.b"]`
- `ui/js/core/app-actions.js:157` `rgb(${props["font.color.r"]}, ${props["font.color.g"]}, ${props["font.color.b"]}),`
