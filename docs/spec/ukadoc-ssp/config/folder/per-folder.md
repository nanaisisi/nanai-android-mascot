# フォルダ個別設定

- **規格**: [folder.md](../../../../ukadoc-ssp/config/folder.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/config/folder/))
- **検索語**: folder, each
- **対応状況**: ✅ 実装済

## 突合結果

フォルダごとの個別設定は未実装。


## 実装箇所

- `src-tauri/src/commands/install/mod.rs:109` `"📦 Creating NAR archive from folder: {} -> {}",`
- `ui/ts/core/actions/menu-action-dispatcher.ts:350` `return handleMenuActionImpl(context, "open-folder", payload);`
- `ui/ts/ui/submenu-renderer.ts:248` `action: "open-folder",`
- `tests/app-actions.test.ts:29` `test("actionMethods.handleMenuAction covers all branches including Tauri folder `
- `src-tauri/src/commands/install/archive/packaging.rs:14` `"folder.htt",`
- `ui/ts/core/actions/menu-action-dispatcher.ts:362` `if (action === "open-folder") {`
