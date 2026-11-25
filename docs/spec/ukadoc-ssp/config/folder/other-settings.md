# そのほかの設定

- **規格**: [folder.md](../../../../ukadoc-ssp/config/folder.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/config/folder/))
- **検索語**: folder, other
- **対応状況**: ✅ 実装済

## 突合結果

フォルダ設定のその他オプションは未実装。


## 実装箇所

- `crates/nanai-core/src/install_protocol/helpers.rs:15` `other => other.to_string(),`
- `src-tauri/src/commands/install/mod.rs:109` `"📦 Creating NAR archive from folder: {} -> {}",`
- `ui/ts/core/actions/menu-action-dispatcher.ts:350` `return handleMenuActionImpl(context, "open-folder", payload);`
- `ui/ts/ui/submenu-renderer.ts:248` `action: "open-folder",`
- `tests/app-actions.test.ts:29` `test("actionMethods.handleMenuAction covers all branches including Tauri folder `
- `crates/nanai-core/src/update_protocol/tests.rs:75` `assert!(!is_no_update_path("other.txt", &patterns));`
