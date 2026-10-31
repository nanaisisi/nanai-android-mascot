# `balloonc*.png` / `balloonc*.pna`

- **対応状況**: ✅ 実装済
- **実装ファイル**:
  - [balloon.rs](../../../../src-tauri/src/commands/shell/balloon.rs) (`load_balloon_image`)
  - [balloon-window.js](../../../../ui/js/ghost/balloon-window.js)

選択肢や入力ボックス用バルーン画像（`balloonc0.png` 等）の VFS 経由ロードに対応。


## 実装箇所

- `ui/js/ghost/balloon-window.js:148` `// オプションアセット (balloonc, arrow, sstp, online) のロード試行`
- `ui/js/ghost/balloon-window.js:152` `file: "balloonc0.png",`
