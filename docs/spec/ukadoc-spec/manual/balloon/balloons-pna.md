# `balloons*.pna`

- **規格**: [balloon.md](../../../../ukadoc-spec/manual/balloon.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/balloon/))
- **検索語**: balloons0.pna, processChromaKey
- **対応状況**: ✅ 実装済

## 突合結果

`docs/ukadoc-spec/manual/balloon.md` で定義される `balloons*.png` に対応するグレースケール透明度マスク `.pna` ファイル（例: `balloons0.png` に対する `balloons0.pna`）の読み込みとアルファ合成を実装済み。`loadBalloonSkinImages` (`ui/ts/ghost/balloon-window/theme.ts:244-256`) が解決された `balloons*.png`（`.svg` 以外）の拡張子を `.pna` に置換して `load_balloon_image` (`src-tauri/src/commands/shell/balloon.rs:304-313,390`) で取得し、`processChromaKey` (`ui/ts/surface/surface-compositor.ts:69,119-129,179-184`) でアルファチャンネルへ合成する。また `descript.txt` の `use_self_alpha` も `applyAssetProperties` (`ui/ts/core/actions/balloon-descript/assets.ts:464-467`) で CSS 変数 `--balloon-use-self-alpha` へ設定される（なお `loadBalloonSkinImages` の `processChromaKey` 呼び出し自体は `useSelfAlpha` オプションを渡していない）。

## 実装箇所

- `ui/ts/ghost/balloon-window/theme.ts:245` `const pnaFile = usedFile.replace(/\.(png|bmp|jpg|jpeg)$/i, ".pna");`
- `ui/ts/ghost/balloon-window/theme.ts:255` `? await processChromaKey(bgImageRaw, pnaImage)`
- `src-tauri/src/commands/shell/balloon.rs:304` `} else if req_ext.as_deref() == Some("pna") {`
- `ui/ts/surface/surface-compositor.ts:69` `export async function processChromaKey(`
- `ui/ts/core/actions/balloon-descript/assets.ts:464` `const useSelfAlpha =`
- `tests/ghost-coverage-boost/balloon-theme.test.ts:22` `if (args.file === "balloons0.pna") {`
- `tests/balloon-window.test.ts:871` `imageRequests.some((r) => r.file.endsWith(".pna")),`
