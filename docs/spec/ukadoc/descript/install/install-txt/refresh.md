# refresh,数値

- **規格**: [refresh.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/refresh/) (ukadoc-spec/descript/install/install-txt/refresh.md)
- **検索語**: refresh
- **対応状況**: ❌ 未実装(誤検出)

## 突合結果

ヒットしたのは一般的な語「refresh」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `ui/js/ui/templates/ghost-templates.js:28`  `<button type="button" id="refresh-ghosts-btn">更新</button>`
- `ui/js/ui/templates/ghost-templates.js:49`  `<button type="button" id="refresh-balloons-btn">更新</button>`
- `ui/js/ui/modal-ghost-handlers.js:17`  `document.getElementById("refresh-ghosts-btn")?.addEventListener("click", async () => {`
