# `balloons*.png`

- **規格**: [balloon.md](../../../../ukadoc-spec/manual/balloon.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/balloon/))
- **検索語**: balloons0.png, balloons1.png
- **対応状況**: ✅ 実装済

## 突合結果

`docs/ukadoc-spec/manual/balloon.md` で定義される本体側（`\0` / `scopeId === 0`）の吹き出し画像 `balloons*.png`（偶数 ID が左向き・奇数 ID が右向きのペア、0-1 通常・2-3 縦長など任意セット）を解決・描画する処理を実装済み。`loadBalloonSkinImages` (`ui/ts/ghost/balloon-window/theme.ts:173-238`) が `balloonId` と向き（`side === "right"` の場合は偶数 ID に対して `balloonId + 1` を優先）に応じて `balloons{id}.png`・`balloons2.png`・`balloons1.png`・`balloons0.png`・`balloons.png` を `load_balloon_image` (`src-tauri/src/commands/shell/balloon.rs:281`) 経由で取得し、`--balloon-bg-image` および `backgroundImage` (`ui/ts/ghost/balloon-window/theme.ts:413-417`, `ui/css/balloon-window.css:34-37`) に適用する（描画方式は 9-slice ではなく `background-size: 100% 100%` の全幅表示）。

## 実装箇所

- `ui/ts/ghost/balloon-window/theme.ts:189` `if (scopeId === 0) {`
- `ui/ts/ghost/balloon-window/theme.ts:190` `` candidates.push(`balloons${id}.png`, `balloons${id}.bmp`); ``
- `ui/ts/ghost/balloon-window/theme.ts:208` `: ["balloons0.png", "balloons1.png", "balloons.png"];`
- `src-tauri/src/commands/shell/balloon.rs:281` `pub fn load_balloon_image(`
- `src-tauri/src/commands/shell/balloon.rs:354` `"balloons0.png",`
- `ui/css/balloon-window.css:34` `background-image: var(--balloon-bg-image, var(--balloon-pattern, none));`
- `tests/balloon-window.test.ts:812` `assert.strictEqual(findBgFile(), "balloons0.png");`
- `tests/balloon-window.test.ts:842` `assert.strictEqual(findBgFile(), "balloons3.png");`
