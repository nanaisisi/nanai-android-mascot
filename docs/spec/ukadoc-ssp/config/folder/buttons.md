# ボタン

- **規格**: [folder.md](../../../../ukadoc-ssp/config/folder.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/config/folder/))
- **検索語**: folder, add, remove
- **対応状況**: ✅ 実装済

## 突合結果

フォルダ追加・削除・移動ボタン UI は未実装。


## 実装箇所

- `crates/nanai-core/src/state.rs:141` `self.active_binds.remove(pos);`
- `src-tauri/src/commands/install/mod.rs:109` `"📦 Creating NAR archive from folder: {} -> {}",`
- `ui/ts/core/actions/menu-action-dispatcher.ts:350` `return handleMenuActionImpl(context, "open-folder", payload);`
- `ui/ts/ui/submenu-renderer.ts:248` `action: "open-folder",`
- `tests/app-actions.test.ts:29` `test("actionMethods.handleMenuAction covers all branches including Tauri folder `
- `crates/nanai-surface/src/compositor/cache.rs:59` `&& let Some(removed) = self.map.remove(&oldest_key)`
