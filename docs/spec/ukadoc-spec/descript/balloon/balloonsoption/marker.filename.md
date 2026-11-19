# marker.filename,ファイル名

- **規格**: [marker.filename.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/balloonsoption/marker.filename.md)
- **検索語**: marker.filename
- **対応状況**: ✅ 実装済

## 突合結果

`ui/ts/core/actions/balloon-descript/assets.ts` の `resolveAndSetMarker` およびスコープ別標準マーカー（`markers.png`, `markerk.png`, `markerp*def.png`, `marker.png`）のフォールバック・動的解決、`ui/ts/ghost/balloon-window/theme.ts` でのプリロードを完全実装済み。

## 実装箇所

- `ui/css/balloon-window.css` `/* バルーンマーカー (marker.filename) */`
- `ui/ts/core/actions/balloon-descript/assets.ts` `resolveAndSetMarker`
- `ui/ts/ghost/balloon-window/theme.ts` マーカー画像プリロード処理
