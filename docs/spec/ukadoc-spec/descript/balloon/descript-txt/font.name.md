# font.name,フォント名

- **規格**: [font.name.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/descript-txt/font.name/) (ukadoc-spec/descript/balloon/descript-txt/font.name.md)
- **検索語**: font.name
- **対応状況**: ✅ 対応済

## 突合結果

`app-actions.js` の `applyBalloonDescript()` において `props["font.name"]` を取得し、文書のルート要素に対して `--balloon-font-family: \`"\${props["font.name"]}", Meiryo, sans-serif\`` カスタムプロパティとして動的バインドされる実装が行われている。
