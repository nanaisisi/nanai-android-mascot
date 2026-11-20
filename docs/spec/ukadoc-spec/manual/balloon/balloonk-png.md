# `balloonk*.png`

- **規格**: [balloon.md](../../../../ukadoc-spec/manual/balloon.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/balloon/))
- **検索語**: balloonk0.png, balloonk1.png
- **対応状況**: ✅ 実装済

## 突合結果

`docs/ukadoc-spec/manual/balloon.md` で定義される相方側（`\1` / `scopeId === 1`）の吹き出し画像 `balloonk*.png` の読み込み・描画を実装済み。`loadBalloonSkinImages` (`ui/ts/ghost/balloon-window/theme.ts:191-192,210-217`) が `scopeId === 1` の場合に `balloonk{id}.png`・`balloonk2.png`・`balloonk1.png`・`balloonk3.png`・`balloonk0.png`・`balloonk.png` を探索し、バックエンド `load_balloon_image` (`src-tauri/src/commands/shell/balloon.rs:331-351`) も `balloonk0` / `balloonk` 系フォールバックを行う（なお `theme.ts:210-217` の探索候補には `balloons0.png` が含まれないため、`balloonk*` 一式が完全に省略された場合の本体側へのフォールバックは未定義）。

## 実装箇所

- `ui/ts/ghost/balloon-window/theme.ts:191` `} else if (scopeId === 1) {`
- `ui/ts/ghost/balloon-window/theme.ts:192` ``candidates.push(`balloonk${id}.png`, `balloonk${id}.bmp`);``
- `ui/ts/ghost/balloon-window/theme.ts:210` `} else if (scopeId === 1) {`
- `ui/ts/ghost/balloon-window/theme.ts:216` `: ["balloonk0.png", "balloonk1.png", "balloonk3.png", "balloonk.png"];`
- `src-tauri/src/commands/shell/balloon.rs:345` `let fallback_files = if stem.starts_with("balloonk") {`
- `tests/balloon-window.test.ts:149` `const loadedKero = await loadBalloonSkinImages("ivory", 1);`
- `tests/balloon-window/theme.test.ts:19` `const keroImg = await loadBalloonSkinImages("ivory", 1);`
