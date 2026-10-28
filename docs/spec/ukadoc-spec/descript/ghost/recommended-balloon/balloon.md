# balloon,バルーン名

- **規格**: [balloon.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/recommended-balloon/balloon/) (ukadoc-spec/descript/ghost/recommended-balloon/balloon.md)
- **検索語**: balloon
- **対応状況**: ❌ 未実装(誤検出)

## 突合結果

ヒットしたのは一般的な語「balloon」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `ui/js/ui/modal.js:61` `} else if (contentId === "balloon-modal-content") {`
- `ui/js/ghost/ghost.js:176` `this.app.setBalloonTheme?.(this.app.settings?.balloonTheme || "default");`
- `ui/js/ui/templates/ghost-templates.js:32` `"balloon-modal-content": `
- `ui/js/ui/templates/ghost-templates.js:36` `<div class="current-balloon" id="current-balloon">デフォルト</div>`
- `ui/js/ui/templates/ghost-templates.js:40` `<div class="balloon-list" id="balloon-list">`
