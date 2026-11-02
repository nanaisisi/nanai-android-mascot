# overlay

- **規格**: [overlay.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/overlay/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/overlay.md)
- **検索語**: overlay
- **対応状況**: ✅ 実装済


## 実装箇所

- `src-tauri/src/lib.rs:40` `commands::window::request_overlay_permission,`
- `src-tauri/src/lib.rs:122` `commands::window::request_overlay_permission,`
- `src-tauri/src/commands/window/android.rs:4` `pub async fn request_overlay_permission() -> Result<String, String> {`
- `src-tauri/src/commands/window/android.rs:34` `pub async fn set_overlay_transparency(alpha: f64) -> Result<f64, String> {`
- `src-tauri/src/commands/window/android.rs:71` `let perm = request_overlay_permission().await.unwrap();`
