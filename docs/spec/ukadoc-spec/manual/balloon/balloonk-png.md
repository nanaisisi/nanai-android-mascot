# `balloonk*.png`

- **対応状況**: ❌ 未実装
- **実装ファイル**:
  - [balloon.rs](../../../../src-tauri/src/commands/shell/balloon.rs) (`load_balloon_image`)
  - [balloon-window.js](../../../../ui/js/ghost/balloon-window.js)

相方側の吹き出し画像を `load_balloon_image` で読み込み、`balloonk0.png` を CSS の 9-slice 背景として表示。
