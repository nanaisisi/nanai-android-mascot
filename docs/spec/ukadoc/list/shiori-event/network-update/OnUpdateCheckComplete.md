# OnUpdateCheckComplete

- **規格**: [OnUpdateCheckComplete.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/OnUpdateCheckComplete/) (ukadoc-spec/list/shiori-event/network-update/OnUpdateCheckComplete/)
- **検索語**: OnUpdateCheckComplete
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

更新チェックのみ実行時 (メニュー「ネットワーク更新チェックのみ」/ checkOnly オプション) に check_ghost_update の成功結果を元に送信する。更新あり: Reference0 = 更新ファイル総数、更新なし: "none"。Reference1 = ファイル名リスト (カンマ区切り)、Reference3 = "ghost"、Reference4 = "manual"。

## 実装箇所

- `ui/menu-iframe.html` (`<button ... id="updatecheck-btn">ネットワーク更新チェックのみ`)
- `ui/js/ui/context-menu.js` (keyMap) `c: "updatecheck"`
- `ui/js/core/app-actions.js` `if (action === "updatecheck") { return this.startNetworkUpdate(null, { checkOnly: true }); }`
- `ui/js/core/app-update.js` `await gc.sendShioriEvent("OnUpdateCheckComplete", [checkResult.has_update ? String(checkResult.total_count) : "none", fileNames.join(","), "", "ghost", "manual"])`
