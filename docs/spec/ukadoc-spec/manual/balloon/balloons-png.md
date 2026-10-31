# `balloons*.png`

- **対応状況**: ❌ 未実装
- **実装ファイル**:
  - [balloon.rs](../../../../src-tauri/src/commands/shell/balloon.rs) (`load_balloon_image`)
  - [balloon-window.js](../../../../ui/js/ghost/balloon-window.js)

本体側の吹き出し画像を `load_balloon_image` で読み込み、`balloons0.png` を CSS の 9-slice 背景として表示。
