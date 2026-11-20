# `balloonk*.pna`

- **規格**: [balloon.md](../../../../ukadoc-spec/manual/balloon.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/balloon/))
- **検索語**: balloonk0.png, processChromaKey
- **対応状況**: ✅ 実装済

## 突合結果

`docs/ukadoc-spec/manual/balloon.md` で定義される `balloonk*.png` に対応する透明度マスク `.pna` ファイルの読み込み・アルファ合成を実装済み。`loadBalloonSkinImages` (`ui/ts/ghost/balloon-window/theme.ts:244-256`) が `scopeId === 1` で解決された `balloonk*.png`（`.svg` 以外）の拡張子を `.pna` に置換し、`load_balloon_image` (`src-tauri/src/commands/shell/balloon.rs:304-313,390`) で取得したマスクを `processChromaKey` (`ui/ts/surface/surface-compositor.ts:69,179-184`) へ渡してアルファ合成する。

## 実装箇所

- `ui/ts/ghost/balloon-window/theme.ts:192` ``candidates.push(`balloonk${id}.png`, `balloonk${id}.bmp`);``
- `ui/ts/ghost/balloon-window/theme.ts:245` `const pnaFile = usedFile.replace(/\.(png|bmp|jpg|jpeg)$/i, ".pna");`
- `ui/ts/ghost/balloon-window/theme.ts:255` `? await processChromaKey(bgImageRaw, pnaImage)`
- `src-tauri/src/commands/shell/balloon.rs:304` `} else if req_ext.as_deref() == Some("pna") {`
- `ui/ts/surface/surface-compositor.ts:69` `export async function processChromaKey(`
- `tests/balloon-window/theme.test.ts:19` `const keroImg = await loadBalloonSkinImages("ivory", 1);`
