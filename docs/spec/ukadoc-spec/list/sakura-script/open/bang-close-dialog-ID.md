# \![close,dialog,ID]

- **規格**: [bang-close-dialog-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/open/bang-close-dialog-ID/) (ukadoc-spec/list/sakura-script/open/bang-close-dialog-ID.md)
- **検索語**: Close
- **対応状況**: ✅ 実装済

## 突合結果

\\![close,...] コマンドのパース処理を実装 (crates/ui/src/script/parser/brackets/handlers/raiselike.rs -> SakuraCommand::Close)。

## 実装箇所

- `src-tauri/src/shiori/fmo.rs:42` `fn CloseHandle(hObject: HANDLE) -> BOOL;`
- `src-tauri/src/shiori/fmo.rs:53` `CloseHandle(handle);`
- `src-tauri/src/shiori/ffi/builder.rs:84` `.event("OnClose")`
- `crates/ui/src/script/command.rs:118` `Close {`
- `crates/ui/src/script/parser/brackets/handlers/raiselike.rs:249` `callback(SakuraCommand::Close { service, target });`
