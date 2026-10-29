# overlay

- **規格**: [overlay.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/overlay/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/overlay.md)
- **検索語**: overlay
- **対応状況**: ⚠️ 一部対応

## 突合結果

surface-parser.js が解析 (パターン種別など) するが、描画への反映は個別未確認。

## 実装箇所

- `src-tauri/src/lib.rs:38` `commands::window::request_overlay_permission,`
- `src-tauri/src/lib.rs:119` `commands::window::request_overlay_permission,`
- `src-tauri/src/commands/window/android.rs:4` `pub async fn request_overlay_permission() -> Result<String, String> {`
- `src-tauri/src/commands/shell/manifest.rs:116` `DrawMethod::Overlay => "overlay".to_string(),`
- `src-tauri/src/commands/shell/manifest.rs:117` `DrawMethod::OverlayFast => "overlayfast".to_string(),`
