# cursor,ファイル名 / mousecursor,ファイル名

- **規格**: [cursor.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/descript-txt/cursor/) (ukadoc-spec/descript/balloon/descript-txt/cursor.md)
- **検索語**: cursor
- **対応状況**: ❓ 要確認(surface 関連語)

## 突合結果

サーフェス処理 (ui/js/surface/) に関連する語「cursor」が出現。surfaces.txt の該当機能として実装されているかは個別の読解が必要。

## 実装箇所

- `ui/js/ui/templates/ghost-templates.js:21`  `<button type="button" id="import-ghost-btn" class="primary" style="flex: 0 0 auto; white-s`
- `ui/js/ui/templates/ghost-templates.js:63`  `<button type="button" id="modal-install-submit-btn" class="primary" style="flex: 0 0 auto;`
- `ui/js/ui/modal-ghost-handlers.js:213`  `<div class="ghost-item ${currentTheme === b.id ? "active" : ""}" data-theme="${b.id}" styl`
- `ui/js/ui/modal-ghost-handlers.js:248`  `<div class="ghost-item ${this.app.ghostController.currentGhost?.name === ghost.name ? "act`
- `ui/js/surface/balloon-drag.js:61`  `balloon.style.cursor = "grabbing";`
