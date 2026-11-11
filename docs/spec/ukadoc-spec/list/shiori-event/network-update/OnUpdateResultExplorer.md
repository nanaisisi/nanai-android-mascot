# OnUpdateResultExplorer

- **規格**: [OnUpdateResultExplorer.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/OnUpdateResultExplorer/) (ukadoc-spec/list/shiori-event/network-update/OnUpdateResultExplorer.md)
- **検索語**: OnUpdateResultExplorer
- **対応状況**: ⚠️ 一部対応

## 突合結果

実装コード内に「OnUpdateResultExplorer」を確認。

## 実装箇所

- `src-tauri/src/shiori/ffi/builder.rs:182` `.event("OnUpdateResultExplorer")`
- `ui/ts/core/app-update.ts:141` `await gc.sendShioriEvent("OnUpdateResultExplorer", [`
- `ui/ts/core/actions/update-protocol.ts:11` `* - OnUpdateProcessExec / OnUpdateResult / OnUpdateResultEx / OnUpdateResultExpl`
