# `balloonp*def*.png`

- **規格**: [balloon.md](../../../../ukadoc-spec/manual/balloon.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/balloon/))
- **検索語**: balloonp
- **対応状況**: ✅ 実装済

## 突合結果

`docs/ukadoc-spec/manual/balloon.md` で定義される三人目以降（`\p[2]` など）の吹き出し画像（`balloonp*def*.png`、省略時は `balloonk` → `balloons`）に対応済み。`loadBalloonSkinImages` (`ui/ts/ghost/balloon-window/theme.ts`) で `balloonp${scopeId}def${id}.png` / `balloonp${scopeId}def${id}.bmp` および向き別 `balloonp${scopeId}def0..3.png` / `balloonp${scopeId}def.png` を探索し、未検出時は `balloonk` → `balloons` へフォールバックする。

## 実装箇所

- `ui/ts/ghost/balloon-window/theme.ts:195` `` `balloonp${scopeId}_${id}.png`, ``
- `ui/ts/ghost/balloon-window/theme.ts:220` `` `balloonp${scopeId}.png`, ``
- `ui/ts/ghost/balloon-window/theme.ts:221` `` `balloonp${scopeId}_0.png`, ``
- `ui/ts/ghost/balloon-window/theme.ts:222` `"balloons0.png",`
- `tests/ghost-coverage-boost/balloon-theme.test.ts:15` `if (args.file.startsWith("balloonp2")) {`
- `tests/balloon-window.test.ts:151` `const loadedChar = await loadBalloonSkinImages("ivory", 2);`
