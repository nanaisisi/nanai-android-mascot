# arrow.filename,ファイル名

- **規格**: [arrow.filename.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/balloonsoption/arrow.filename.md)
- **検索語**: arrow.filename
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/assets.js` の `applyAssetProperties()` 内 `setBalloonImage("arrow.filename", "--balloon-arrow-image")` にて動的解決・バインド対応済。

## 実装箇所

- `ui/css/balloon-window.css:206` `/* バルーンオプション画像 (arrow.filename, clickwaitmarker.filename 等) */`
- `ui/ts/core/actions/balloon-descript/assets.ts:132` `// [arrow.filename,ファイル名]: UKADOC 準拠ベース名展開 (拡張子なし -> arrow0.png / arrow1.png)`
- `ui/ts/core/actions/balloon-descript/assets.ts:133` `if (p["arrow.filename"]) {`
- `ui/ts/core/actions/balloon-descript/assets.ts:135` `const arrowBase = p["arrow.filename"];`
- `ui/ts/core/actions/balloon-descript/assets.ts:162` `setBalloonImage("arrow.filename", "--balloon-arrow-image");`
