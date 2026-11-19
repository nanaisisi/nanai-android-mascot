# `marker.png / markers.png / markerk.png / markerp*def.png`

- **規格**: [balloon.md](../../../../ukadoc-spec/manual/balloon.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/balloon/))
- **検索語**: markers.png, markerk.png, balloon-marker
- **対応状況**: ⚠️ 一部対応

## 突合結果

`docs/ukadoc-spec/manual/balloon.md` で定義される `\![*]`（`%\*`）表示専用マーカー画像（`markers.png`: 本体、`markerk.png`: 相方、`markerp*def.png`: `\p[2]` 以降、`marker.png`: 共通/旧互換）は基本描画まで実装されているが、フォールバック経路および画像サイズ・PNA 反映に一部不足がある。

- `applyAssetProperties` (`ui/ts/core/actions/balloon-descript/assets.ts:251-288`) が `scopeId === 0` で `markers.png`、`scopeId === 1` で `markerk.png`、`scopeId >= 2` で `markerp${scopeId}def.png` を探索して `--balloon-marker-image` に設定し、`SakuraScriptPlayer.appendMarkerToBalloon` (`ui/ts/ghost/sakura-script.ts:629-643`) が `\![*]` 実行時に `balloon-marker` クラスの要素 (`ui/css/balloon-window.css:354-363`) を追加する。
- ただし `assets.ts:284-288` では `resolveAndSetMarker(defaultMarkerFile, "markers.png", ...)` を呼ぶため、`scopeId === 0`（`defaultMarkerFile === "markers.png"`）時に `markers.png` が存在しなくても `fallbackFile !== file` が偽となり `marker.png` へフォールバックしない（また `marker.png` 不在時の `sstp.png` フォールバックも未実装）。加えて `.pna` 合成および `--balloon-marker-width` / `--balloon-marker-height` 設定は未実装で 16px×16px 固定サイズ表示となる。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/assets.ts:251` `const defaultMarkerFile = p["marker.filename"]`
- `ui/ts/core/actions/balloon-descript/assets.ts:254` `? "markerk.png"`
- `ui/ts/core/actions/balloon-descript/assets.ts:256` `` ? `markerp${scopeId}def.png` ``
- `ui/ts/core/actions/balloon-descript/assets.ts:257` `: "markers.png";`
- `ui/ts/ghost/balloon-window/theme.ts:283` `invoke("load_balloon_image", { name: theme, file: "markers.png" }).catch(`
- `ui/ts/ghost/sakura-script.ts:641` `markerSpan.className = "balloon-marker";`
- `ui/css/balloon-window.css:354` `.balloon-marker {`
