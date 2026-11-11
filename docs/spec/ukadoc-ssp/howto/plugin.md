# 基本的な使い方：プラグイン

- **規格**: [howto/plugin.md](https://ukatech.shillest.net/ukadoc-ssp/howto/plugin/) (ukadoc-ssp/howto/plugin.md)
- **対応状況**: ⚠️ 一部対応

## 突合結果

プラグイン管理モーダル、PLUGIN/2.0 イベント送受信パイプライン

## 実装箇所

- `src-tauri/src/lib.rs:102` `.plugin(tauri_plugin_opener::init())`
- `src-tauri/src/lib.rs:103` `.plugin(tauri_plugin_dialog::init())`
- `src-tauri/src/commands/ext.rs:13` `search_dirs.push(app_data_dir.join("userData").join("plugin"));`
- `src-tauri/src/commands/ext.rs:14` `search_dirs.push(app_data_dir.join("plugin"));`
- `src-tauri/src/commands/ext.rs:17` `search_dirs.push(current_dir.join("assets").join("plugin"));`
