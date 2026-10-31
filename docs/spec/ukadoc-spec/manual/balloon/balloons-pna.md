# `balloons*.pna`

- **対応状況**: ✅ 実装済
- **実装ファイル**:
  - [balloon.rs](../../../../src-tauri/src/commands/shell/balloon.rs) (`load_balloon_image`)
  - [surface-compositor.js](../../../../ui/js/surface/surface-compositor.js) (`processChromaKey`)
  - [balloon-window.js](../../../../ui/js/ghost/balloon-window.js)

`balloons0.pna` などの PNA マスクを `processChromaKey` により透過アルファとして適用。
