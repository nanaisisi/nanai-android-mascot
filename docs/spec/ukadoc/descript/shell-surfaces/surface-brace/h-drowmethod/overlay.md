# overlay

- **規格**: [overlay.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/overlay/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/overlay.md)
- **検索語**: overlay
- **対応状況**: ⚠️ 一部対応

## 突合結果

surface-parser.js が解析 (パターン種別など) するが、描画への反映は個別未確認。

## 実装箇所

- `src-tauri/src/commands/window/android.rs:3` `pub async fn request_overlay_permission() -> Result<String, String> {`
- `ui/js/ui/modal.js:16` `this.overlay = document.getElementById("modal-overlay");`
- `ui/js/ui/modal.js:30` `this.overlay?.addEventListener("click", (e) => {`
- `ui/js/ui/modal.js:31` `if (e.target === this.overlay) {`
- `ui/js/ui/modal.js:43` `if (!html || !this.content || !this.overlay) return;`
