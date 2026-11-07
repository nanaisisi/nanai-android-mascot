# `sstp.png`

- **規格**: [sstp-png.md](https://ukatech.shillest.net/ukadoc-spec/manual/balloon/)
- **検索語**: sstp.png
- **対応状況**: ✅ 実装済
- **実装ファイル**:
  - [balloon.rs](../../../../src-tauri/src/commands/shell/balloon.rs) (`load_balloon_image`)
  - [balloon-window.js](../../../../ui/js/ghost/balloon-window.js)

SSTP 受信メッセージ用バルーン画像（`sstp.png`）の VFS 経由ロードに対応。

## 実装箇所

- `src-tauri/src/commands/shell/balloon.rs:163` `pub fn load_balloon_image(`
- `ui/ts/ghost/balloon-window/theme.ts:88` `invoke("load_balloon_image", { name: theme, file: "sstp.png" })`
