# marker.filename,ファイル名

- **規格**: [marker.filename.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/balloonsoption/marker.filename.md)
- **検索語**: marker.filename
- **対応状況**: ⚠️ 一部対応

## 突合結果

`ui/ts/core/actions/balloon-descript/assets.ts` の `resolveAndSetMarker` およびスコープ別標準マーカー（`markers.png`, `markerk.png`, `markerp*def.png`, `marker.png`）のフォールバック・動的解決、`ui/ts/ghost/balloon-window/theme.ts` でのプリロードを完全実装済み。

## 実装箇所

- `crates/nanai-core/src/balloon_descript.rs:115` `/// クリック待ちマーカー画像ファイル名 (`marker.filename`)`
- `ui/ts/core/actions/balloon-descript/assets.ts:316` `// [marker.filename,ファイル名] または UKADOC 標準マーカー (`markers.png`, `markerk.png`, `mar`
- `ui/css/balloon-window.css:353` `/* バルーンマーカー (marker.filename) */`
- `crates/nanai-core/src/balloon_descript.rs:117` `self.get("marker.filename")`
- `ui/ts/core/actions/balloon-descript/assets.ts:317` `const defaultMarkerFile = p["marker.filename"]`
- `ui/ts/core/actions/balloon-descript/assets.ts:318` `? p["marker.filename"]`
