# title,表示名

- **規格**: [title.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/title/) (ukadoc-spec/descript/ghost/descript-txt/title.md)
- **検索語**: title
- **対応状況**: ❌ 未実装(誤検出)

## 突合結果

ヒットしたのは一般的な語「title」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `src-tauri/src/commands/window/menu_window.rs:56`  `.title("Nanai Menu")`
- `src-tauri/src/commands/window/menu_window.rs:143`  `.title("Nanai Submenu")`
- `ui/js/ui/modal.js:75`  `showNotification(title, message, isError = false) {`
- `ui/js/ui/modal.js:78`  `<h2>${isError ? "⚠️ " : "ℹ️ "}${title}</h2>`
- `ui/js/ui/test-menu.js:14`  `export function openModal(title) {`
