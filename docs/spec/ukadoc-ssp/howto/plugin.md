# 基本的な使い方：プラグイン

- **規格**: [howto/plugin.md](https://ukatech.shillest.net/ukadoc-ssp/howto/plugin/) (ukadoc-ssp/howto/plugin.md)
- **対応状況**: ✅ 実装済

## 突合結果

プラグイン管理モーダル、PLUGIN/2.0 イベント送受信パイプライン

## 実装箇所

- `crates/nanai-core/src/install_protocol.rs:9` `"plugin",`
- `src-tauri/src/lib.rs:121` `.plugin(tauri_plugin_opener::init())`
- `ui/assets/LICENSE-3RD-PARTY.html:6846` `<li><a href="https://github.com/tauri-apps/tauri-plugin-vibrancy" target="_blank`
- `ui/menu-iframe.html:48` `<button type="button" class="menu-item main-only has-submenu" id="plugin-btn" ro`
- `tests/app-menu.test.ts:130` `if (cmd === "plugin:event|emit") {`
- `crates/nanai-core/src/install_protocol.rs:14` `"calendar.plugin",`
