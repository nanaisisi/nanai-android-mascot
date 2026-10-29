# OnUpdateCheckComplete

- **規格**: [OnUpdateCheckComplete.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/OnUpdateCheckComplete/) (ukadoc-spec/list/shiori-event/network-update/OnUpdateCheckComplete/)
- **検索語**: OnUpdateCheckComplete
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

更新チェックのみ実行時 (メニュー「ネットワーク更新チェックのみ」/ checkOnly オプション) に check_ghost_update の成功結果を元に送信する。更新あり: Reference0 = 更新ファイル総数、更新なし: "none"。Reference1 = ファイル名リスト (カンマ区切り)、Reference3 = "ghost"、Reference4 = "manual"。

## 実装箇所

- `ui/js/core/app-update.js:11` `*    - チェックのみ実行時: OnUpdateCheckComplete / OnUpdateCheckFailure`
- `ui/js/core/app-update.js:88` `// チェックのみ実行: OnUpdateCheckComplete (Ref0: 総数 または "none")`
- `ui/js/core/app-update.js:90` `await gc.sendShioriEvent("OnUpdateCheckComplete", [`
