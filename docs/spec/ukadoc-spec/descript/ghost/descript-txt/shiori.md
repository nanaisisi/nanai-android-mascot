# shiori,ファイル名

- **規格**: [shiori.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/shiori.md)
- **検索語**: shiori
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `shiori` キーをパースし、SHIORI 動的モジュール (`GhostInfo.shiori`) へ反映する実装が行われている。

## 実装箇所

- `crates/nanai-core/src/descript_parser.rs:29` `pub fn shiori(&self) -> Option<&str> {`
- `src-tauri/build.rs:16` `println!("cargo:rerun-if-changed=shiori-host/src");`
- `ui/assets/LICENSE-3RD-PARTY.html:7426` `<li><a href="https://crates.io/crates/nanai-shiori-vm" target="_blank" rel="noop`
- `ui/ts/ui/modal-settings-handlers.ts:252` `bindShioriTestButton("test-shiori-init", "OnBoot", "SHIORI初期化");`
- `tests/balloon-events.test.ts:4` `import { shioriNotifyMethods } from "../ui/ts/ghost/shiori-notify.js";`
- `crates/nanai-core/src/descript_parser.rs:30` `self.get("shiori").or_else(|| self.get("shiori.dll"))`
