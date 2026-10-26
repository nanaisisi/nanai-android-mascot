# overlay

- **規格**: [overlay.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/overlay/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/overlay.md)
- **検索語**: overlay
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「overlay」が出現。実際の処理内容は未精査。

## 実装箇所

- `src-tauri/src/commands/window/android.rs:3`  `pub async fn request_overlay_permission() -> Result<String, String> {`
- `ui/js/ui/modal.js:16`  `this.overlay = document.getElementById("modal-overlay");`
- `ui/js/ui/modal.js:30`  `this.overlay?.addEventListener("click", (e) => {`
- `ui/js/ui/modal.js:31`  `if (e.target === this.overlay) {`
- `ui/js/ui/modal.js:43`  `if (!html || !this.content || !this.overlay) return;`
