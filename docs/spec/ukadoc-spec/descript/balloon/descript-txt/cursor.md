# cursor,ファイル名 / mousecursor,ファイル名

- **規格**: [cursor.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/cursor.md)
- **検索語**: cursor
- **対応状況**: ❌ 未実装

## 突合結果

surface-parser.js / surface-animation-manager.js に該当の解析・処理は確認できない。

## 実装箇所

- `ui/js/ui/templates/ghost-templates.js:21` `<button type="button" id="import-ghost-btn" class="primary" style="flex: 0 0 auto; white-s`
- `ui/js/ui/templates/ghost-templates.js:63` `<button type="button" id="modal-install-submit-btn" class="primary" style="flex: 0 0 auto;`
- `ui/js/ui/modal-ghost-handlers.js:213` `<div class="ghost-item ${currentTheme === b.id ? "active" : ""}" data-theme="${b.id}" styl`
- `ui/js/ui/modal-ghost-handlers.js:248` `<div class="ghost-item ${this.app.ghostController.currentGhost?.name === ghost.name ? "act`
- `ui/js/surface/balloon-drag.js:61` `balloon.style.cursor = "grabbing";`
