# `balloonc*.png`

- **規格**: [balloon.md](../../../../ukadoc-spec/manual/balloon.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/balloon/))
- **検索語**: balloonc0.png
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/commands/shell/balloon.rs` の `load_balloon_image` にて `balloonc0` -> `balloonc` のフォールバックを含む `balloonc*.png` / `balloonc*.bmp` の画像解決に対応済み。`loadBalloonSkinImages` (`ui/ts/ghost/balloon-window/theme.ts`) で `"balloonc0.png"` および `.pna` を読み込み、`processChromaKey` で合成したうえで `--balloon-inputbox-bg-image` CSS カスタムプロパティへ適用している。

## 実装箇所

- `ui/ts/ghost/balloon-window/theme.ts:260` `invoke("load_balloon_image", {`
- `ui/ts/ghost/balloon-window/theme.ts:262` `file: "balloonc0.png",`
- `ui/ts/ghost/command-handler/inputbox.ts:55` `const form = document.createElement("div");`
- `ui/ts/ghost/command-handler/communicatebox.ts:44` `form.className = "balloon-inputbox-form balloon-communicatebox-form";`
- `ui/ts/ghost/command-handler/teachbox.ts:35` `form.className = "balloon-inputbox-form";`
