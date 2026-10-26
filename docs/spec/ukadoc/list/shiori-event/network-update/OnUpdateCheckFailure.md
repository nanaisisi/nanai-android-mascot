# OnUpdateCheckFailure

- **規格**: [OnUpdateCheckFailure.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/OnUpdateCheckFailure/) (ukadoc-spec/list/shiori-event/network-update/OnUpdateCheckFailure/)
- **検索語**: OnUpdateCheckFailure
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

更新チェックのみ実行時に check_ghost_update が失敗した場合に送信する。Reference0 = 失敗理由 (404 / timeout / fileio)、Reference4 = "manual"。

## 実装箇所

- `ui/menu-iframe.html` (`<button ... id="updatecheck-btn">ネットワーク更新チェックのみ`)
- `ui/js/core/app-actions.js` `if (action === "updatecheck") { return this.startNetworkUpdate(null, { checkOnly: true }); }`
- `ui/js/core/app-update.js` `await gc.sendShioriEvent("OnUpdateCheckFailure", [reason, "", "", "ghost", "manual"])`
