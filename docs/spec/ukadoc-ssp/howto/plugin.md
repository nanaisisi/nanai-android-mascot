# 基本的な使い方：プラグイン

- **規格**: [howto/plugin.md](https://ukatech.shillest.net/ukadoc-ssp/howto/plugin/) (ukadoc-ssp/howto/plugin.md)
- **対応状況**: ✅ 実装済

## 突合結果

プラグイン管理モーダル、PLUGIN/2.0 イベント送受信パイプライン

## 実装箇所

- `src-tauri/tauri.conf.json:44` `"plugins": {`
- `src-tauri/src/lib.rs:88` `.plugin(tauri_plugin_opener::init())`
- `src-tauri/src/lib.rs:89` `.plugin(tauri_plugin_dialog::init())`
- `src-tauri/src/lib.rs:154` `commands::ext::scan_plugins,`
- `src-tauri/src/lib.rs:156` `commands::ext::execute_plugin_event,`
