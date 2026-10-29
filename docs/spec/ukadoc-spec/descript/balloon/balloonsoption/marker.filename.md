# marker.filename,ファイル名

- **規格**: [marker.filename.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/balloonsoption/marker.filename.md)
- **検索語**: marker.filename
- **対応状況**: ✅ 対応済

## 突合結果

`app-actions.js` の `applyBalloonDescript` にて `--balloon-marker-image` として動的解決・バインド対応済。


## 実装箇所

- `ui/css/balloon-window.css:81` `/* バルーンオプション画像 (arrow.filename, clickwaitmarker.filename 等) */`
- `ui/css/balloon-window.css:100` `/* クリック待ちマーカー (clickwaitmarker.filename) */`
- `ui/css/balloon-window.css:112` `/* バルーンマーカー (marker.filename) */`
- `ui/css/balloon-window.css:124` `/* SSTPマーカー (sstpmarker.filename) */`
- `ui/js/core/actions/balloon-descript.js:192` `setBalloonImage("clickwaitmarker.filename", "--balloon-clickwait-image");`
