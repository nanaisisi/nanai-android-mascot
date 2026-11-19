# `arrow0.png / arrow1.png`

- **規格**: [balloon.md](../../../../ukadoc-spec/manual/balloon.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/balloon/))
- **検索語**: arrow0.png, arrow1.png
- **対応状況**: ✅ 実装済

## 突合結果

`docs/ukadoc-spec/manual/balloon.md` で定義されるスクロール矢印画像 `arrow0.png`（上向き）および `arrow1.png`（下向き）の読み込み・描画・スクロール連携を実装済み。`applyBalloonDescript` (`ui/ts/ghost/balloon-window/theme.ts:488-577`) が `arrow0.png` / `arrow1.png`（および対応する `arrow0.pna` / `arrow1.pna`）を `load_balloon_image` と `processChromaKey` で取得し、`--balloon-arrow0-image` / `--balloon-arrow1-image` および幅・高さを設定した上で `data-has-image="true"` を付与する。`ui/css/balloon-window.css:265-328` の `.balloon-scroll-arrow-up` / `.balloon-scroll-arrow-down` と `updateBalloonScrollArrows` (`ui/ts/ghost/balloon-window.ts:164-294`) によりスクロール位置に応じた表示切替とクリック操作が機能する。

## 実装箇所

- `ui/ts/ghost/balloon-window/theme.ts:490` `file: "arrow0.png",`
- `ui/ts/ghost/balloon-window/theme.ts:498` `file: "arrow1.png",`
- `ui/ts/ghost/balloon-window/theme.ts:528` `const pnaFile = file.replace(/\.png$/i, ".pna");`
- `ui/ts/ghost/balloon-window.ts:164` `export function updateBalloonScrollArrows(`
- `ui/css/balloon-window.css:286` `.balloon-scroll-arrow-up {`
- `ui/css/balloon-window.css:296` `.balloon-scroll-arrow-down {`
- `tests/balloon-window.test.ts:748` `"arrow0.png",`
- `tests/balloon-window.test.ts:749` `"arrow1.png",`
