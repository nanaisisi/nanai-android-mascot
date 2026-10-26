# title,表示名

- **規格**: [title.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/title/) (ukadoc-spec/descript/ghost/descript-txt/title.md)
- **検索語**: title
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「title」が出現。実際の処理内容は未精査。

## 実装箇所

- `src-tauri/src/commands/window/menu_window.rs:56`  `.title("Nanai Menu")`
- `src-tauri/src/commands/window/menu_window.rs:143`  `.title("Nanai Submenu")`
- `ui/js/ui/modal.js:75`  `showNotification(title, message, isError = false) {`
- `ui/js/ui/modal.js:78`  `<h2>${isError ? "⚠️ " : "ℹ️ "}${title}</h2>`
- `ui/js/ui/test-menu.js:14`  `export function openModal(title) {`
