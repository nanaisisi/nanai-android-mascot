# `balloonp*def*.pna`

- **規格**: [balloon.md](../../../../ukadoc-spec/manual/balloon.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/balloon/))
- **検索語**: balloonp, .pna
- **対応状況**: ✅ 実装済

## 突合結果

`docs/ukadoc-spec/manual/balloon.md` で定義される `balloonp*def*.png` に対応する透明度マスク `.pna` ファイル（SSP 2.5.51〜）に対応済み。`loadBalloonSkinImages` (`ui/ts/ghost/balloon-window/theme.ts`) で `balloonp*def*.png` を解決し、選択された背景画像 `usedFile` の拡張子を `.pna` に置換して `load_balloon_image` (`src-tauri/src/commands/shell/balloon.rs`) と `processChromaKey` (`ui/ts/surface/surface-compositor.ts`) で合成している。

## 実装箇所

- `ui/ts/ghost/balloon-window/theme.ts:195` `` `balloonp${scopeId}_${id}.png`, ``
- `ui/ts/ghost/balloon-window/theme.ts:220` `` `balloonp${scopeId}.png`, ``
- `ui/ts/ghost/balloon-window/theme.ts:245` `const pnaFile = usedFile.replace(/\.(png|bmp|jpg|jpeg)$/i, ".pna");`
- `ui/ts/ghost/balloon-window/theme.ts:255` `? await processChromaKey(bgImageRaw, pnaImage)`
- `src-tauri/src/commands/shell/balloon.rs:304` `} else if req_ext.as_deref() == Some("pna") {`
- `tests/ghost-coverage-boost/balloon-theme.test.ts:15` `if (args.file.startsWith("balloonp2")) {`
