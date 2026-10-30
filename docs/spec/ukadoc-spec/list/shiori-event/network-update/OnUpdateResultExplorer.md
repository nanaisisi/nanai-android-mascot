# OnUpdateResultExplorer

- **規格**: [OnUpdateResultExplorer.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/OnUpdateResultExplorer/) (ukadoc-spec/list/shiori-event/network-update/OnUpdateResultExplorer.md)
- **検索語**: OnUpdateResultExplorer
- **対応状況**: ❌ 検出なし

## 突合結果

実装コード内に「OnUpdateResultExplorer」を確認。


## 実装箇所

- `src-tauri/src/shiori/ffi/builder.rs:182` `.event("OnUpdateResultExplorer")`
- `ui/js/core/app-update.js:155` `// OnUpdateResultExplorer 送信 (UKADOC準拠: 更新詳細・差分リスト通知)`
- `ui/js/core/app-update.js:157` `await gc.sendShioriEvent("OnUpdateResultExplorer", [`
