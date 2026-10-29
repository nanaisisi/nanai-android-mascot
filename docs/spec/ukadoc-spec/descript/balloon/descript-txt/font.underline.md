# font.underline,0/1

- **規格**: [font.underline.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.underline.md)
- **検索語**: font.underline
- **対応状況**: ❌ 検出なし

## 突合結果

実装コード内に「font.underline」を確認。


## 実装箇所

- `ui/js/core/actions/balloon-descript.js:71` `props["font.underline"] === "1" ||`
- `ui/js/core/actions/balloon-descript.js:72` `props["font.underline"]?.toLowerCase() === "true"`
