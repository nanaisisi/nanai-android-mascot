# `balloonc*.pna`

- **規格**: [balloon.md](../../../../ukadoc-spec/manual/balloon.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/balloon/))
- **検索語**: balloonc0.pna
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/commands/shell/balloon.rs` の `load_balloon_image` にて `balloonc*.pna` の読み込みに対応済み。`loadBalloonSkinImages` (`ui/ts/ghost/balloon-window/theme.ts`) で `balloonc0.pna` / `balloonc.pna` を読み込み、`processChromaKey` で透過マスク合成した画像を `--balloon-inputbox-bg-image` CSS カスタムプロパティへ適用している。

## 実装箇所

実装コード内に「balloonc0.pna」は検出されませんでした。
