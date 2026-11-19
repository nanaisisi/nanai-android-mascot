# sstpmarker.filename,ファイル名

- **規格**: [sstpmarker.filename.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/balloonsoption/sstpmarker.filename.md)
- **検索語**: sstpmarker.filename
- **対応状況**: ✅ 実装済

## 突合結果

`ui/ts/core/actions/balloon-descript/assets.ts` の `setBalloonImage("sstpmarker.filename", "--balloon-sstpmarker-image")` にて動的解決・バインド対応済。

## 実装箇所

- `ui/css/balloon-window.css` `/* SSTPマーカー (sstpmarker.filename) */`
- `ui/ts/core/actions/balloon-descript/assets.ts` `setBalloonImage("sstpmarker.filename", "--balloon-sstpmarker-image");`
- `tests/core-coverage-boost/balloon-descript-coverage.test.ts` `"sstpmarker.filename": "sstp.png"`
