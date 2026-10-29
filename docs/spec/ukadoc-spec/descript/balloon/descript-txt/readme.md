# readme,ファイル名

- **規格**: [readme.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/readme.md)
- **検索語**: readme
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/assets.js` の `applyAssetProperties()` において `props["readme"]` を検出し、`--balloon-readme` カスタムプロパティへバインドする実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/assets.js` `if (props["readme"]) root.style.setProperty("--balloon-readme", props["readme"]);`
