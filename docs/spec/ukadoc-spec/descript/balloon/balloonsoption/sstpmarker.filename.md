# sstpmarker.filename,ファイル名

- **規格**: [sstpmarker.filename.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/balloonsoption/sstpmarker.filename.md)
- **検索語**: sstpmarker.filename
- **対応状況**: ✅ 対応済

## 突合結果

`app-actions.js` の `applyBalloonDescript` にて `--balloon-sstp-image` として動的解決・バインド対応済。


## 実装箇所

- `ui/css/balloon-window.css:124` `/* SSTPマーカー (sstpmarker.filename) */`
- `ui/js/core/actions/balloon-descript.js:195` `setBalloonImage("sstpmarker.filename", "--balloon-sstpmarker-image");`
- `ui/js/core/actions/balloon-descript.js:213` `setBalloonImage("sstpmarker.filename", "--balloon-sstp-image");`
