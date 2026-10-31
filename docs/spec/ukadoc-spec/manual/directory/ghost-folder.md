# ゴーストフォルダ (`ghost/`)

- **対応状況**: ✅ 実装済

ゴーストのルートフォルダ内、および `ghost/master/` 階層にある `descript.txt`、`shiori.dll`、サーフィス画像等を正常に走査・読み込み。


## 実装箇所

- `ui/menu-iframe.html:145` `<button type="button" class="menu-item" id="open-ghost-folder-btn" data-action="`
- `ui/js/core/app-actions.js:125` `if (action === "open-ghost-folder") {`
- `tests/app-actions.test.js:73` `// Test open-ghost-folder in Tauri environment with error catch`
- `tests/app-actions.test.js:80` `handle("open-ghost-folder");`
