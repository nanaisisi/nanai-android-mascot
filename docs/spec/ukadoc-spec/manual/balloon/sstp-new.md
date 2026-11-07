# 新SSTP受信画像 (`sstp_new.png`, `sstp_newk.png`, `sstp_newp*def.png`)

- **規格**: [sstp-new.md](https://ukatech.shillest.net/ukadoc-spec/manual/balloon/)
- **検索語**: sstp_new.png
- **対応状況**: ✅ 実装済
- **実装ファイル**: [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs), [`balloon-window.js`](../../../../ui/js/ghost/balloon-window.js)

専用の新規SSTP受信表示用画像群の VFS ロードに対応。

## 実装箇所

- `src-tauri/src/commands/shell/balloon.rs:163` `pub fn load_balloon_image(`
- `ui/ts/ghost/balloon-window/theme.ts:91` `invoke("load_balloon_image", { name: theme, file: "sstp_new.png" })`
- `ui/ts/ghost/balloon-window/theme.ts:94` `invoke("load_balloon_image", { name: theme, file: "sstp_newk.png" })`
