# wordwrappoint.x,座標

- **規格**: [wordwrappoint.x.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/descript-txt/wordwrappoint.x/) (ukadoc-spec/descript/balloon/descript-txt/wordwrappoint.x.md)
- **検索語**: wordwrappoint.x
- **対応状況**: ✅ 対応済

## 突合結果

`app-actions.js` の `applyBalloonDescript()` において `props["wordwrappoint.x"]` を数値パースし、ドキュメント内の `.balloon` 要素の最大幅（`style.maxWidth = \`${ww}px\``）として動的適用される実装が行われている。
