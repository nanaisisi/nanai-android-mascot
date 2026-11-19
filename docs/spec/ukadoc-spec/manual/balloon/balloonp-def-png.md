# `balloonp*def*.png`

- **規格**: [balloon.md](../../../../ukadoc-spec/manual/balloon.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/balloon/))
- **検索語**: balloonp
- **対応状況**: ⚠️ 一部対応

## 突合結果

`docs/ukadoc-spec/manual/balloon.md` で定義される三人目以降（`\p[2]` など）の吹き出し画像（`balloonp2def0.png` / `balloonp2def1.png`、省略時は `balloonk` → `balloons`）に対し、`scopeId >= 2` 向けの分岐自体は実装されているが命名規約およびフォールバック順が仕様と一致しない。`loadBalloonSkinImages` (`ui/ts/ghost/balloon-window/theme.ts:193-198,218-224`) は `balloonp${scopeId}_${id}.png`・`balloonp${scopeId}.png`・`balloonp${scopeId}_0.png` を探索するため、規格の `balloonp*def*.png`（`def` を含む命名）とは不一致である。また未検出時は `balloonk` を経由せず直接 `balloons0.png` へフォールバックする。

## 実装箇所

- `ui/ts/ghost/balloon-window/theme.ts:195` `` `balloonp${scopeId}_${id}.png`, ``
- `ui/ts/ghost/balloon-window/theme.ts:220` `` `balloonp${scopeId}.png`, ``
- `ui/ts/ghost/balloon-window/theme.ts:221` `` `balloonp${scopeId}_0.png`, ``
- `ui/ts/ghost/balloon-window/theme.ts:222` `"balloons0.png",`
- `tests/ghost-coverage-boost/balloon-theme.test.ts:15` `if (args.file.startsWith("balloonp2")) {`
- `tests/balloon-window.test.ts:151` `const loadedChar = await loadBalloonSkinImages("ivory", 2);`
