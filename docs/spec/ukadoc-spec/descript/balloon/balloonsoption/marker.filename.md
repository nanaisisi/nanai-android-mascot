# marker.filename,ファイル名

- **規格**: [marker.filename.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/balloonsoption/marker.filename.md)
- **検索語**: marker.filename
- **対応状況**: ✅ 実装済

## 突合結果

`ui/ts/core/actions/balloon-descript/assets.ts` の `setBalloonImage("marker.filename", "--balloon-marker-image")` にて動的解決・CSSバインドを完全実装済み。

## 実装箇所

- `ui/css/balloon-window.css:248` `/* バルーンマーカー (marker.filename) */`
- `ui/ts/core/actions/balloon-descript/assets.ts:165` `// [marker.filename,ファイル名]:`
- `ui/ts/core/actions/balloon-descript/assets.ts:166` `setBalloonImage("marker.filename", "--balloon-marker-image");`
