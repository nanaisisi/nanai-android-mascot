# clickwaitmarker.filename,ファイル名

- **規格**: [clickwaitmarker.filename.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/balloonsoption/clickwaitmarker.filename.md)
- **検索語**: clickwaitmarker.filename
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/assets.js` の `applyAssetProperties()` 内 `setBalloonImage("clickwaitmarker.filename", "--balloon-clickwait-image")` にて動的解決・バインド対応済。

## 実装箇所

- `ui/css/balloon-window.css:206` `/* バルーンオプション画像 (arrow.filename, clickwaitmarker.filename 等) */`
- `ui/css/balloon-window.css:225` `/* クリック待ちマーカー (clickwaitmarker.filename) */`
- `ui/ts/core/actions/balloon-descript/assets.ts:163` `// [clickwaitmarker.filename,ファイル名]:`
- `ui/ts/core/actions/balloon-descript/assets.ts:164` `setBalloonImage("clickwaitmarker.filename", "--balloon-clickwait-image");`
- `tests/balloon-descript/all-properties/mock-props.ts:87` `"clickwaitmarker.filename": "marker.png",`
