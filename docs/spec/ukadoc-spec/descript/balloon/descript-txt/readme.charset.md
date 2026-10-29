# readme.charset,文字コード

- **規格**: [readme.charset.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/readme.charset.md)
- **検索語**: readme.charset
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/assets.js` の `applyAssetProperties()` において `props["readme.charset"]` を検出し、`--balloon-readme-charset` カスタムプロパティへバインドする実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/assets.js` `if (props["readme.charset"]) root.style.setProperty("--balloon-readme-charset", props["readme.charset"]);`
