# font.italic,0/1

- **規格**: [font.italic.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.italic.md)
- **検索語**: font.italic
- **対応状況**: ✅ 対応済

## 突合結果

`app-actions.js` の `applyBalloonDescript()` において `props["font.italic"] === "1"`（または `"true"`）を検出し、文書のルート要素に対して `--balloon-font-style: italic` カスタムプロパティを動的設定する実装が行われている。
