# validrect.left,座標

- **規格**: [validrect.left.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/validrect.left.md)
- **検索語**: validrect.left
- **対応状況**: ✅ 対応済

## 突合結果

`app-actions.js` の `applyBalloonDescript()` において `validrect.left, top, right, bottom` を一括パースし、ドキュメント内の `.balloon` 要素の `padding`（`${padTop} ${padRight} ${padBottom} ${padLeft}`）として動的適用される実装が行われている。
