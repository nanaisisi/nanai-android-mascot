# icon,ファイル名

- **規格**: [icon.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/icon.md)
- **検索語**: icon
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `icon` キーをパース・参照する実装が行われている。

## 実装箇所

- `crates/nanai-core/src/descript_parser.rs:69` `pub fn icon(&self) -> Option<&str> {`
- `src-tauri/tauri.conf.json:37` `"icon": [`
- `ui/assets/LICENSE-3RD-PARTY.html:7243` `<li><a href="https://github.com/tauri-apps/tray-icon" target="_blank" rel="noope`
- `ui/index.html:10` `<link rel="icon" type="image/svg+xml" href="../assets/nsm-icon.svg" />`
- `tests/command-handler-boost.test.ts:158` `await handleSetTaskTrayIcon(handler, ["set", "tasktrayicon", "/icon.ico"]);`
- `crates/nanai-core/src/descript_parser.rs:70` `self.get("icon")`
