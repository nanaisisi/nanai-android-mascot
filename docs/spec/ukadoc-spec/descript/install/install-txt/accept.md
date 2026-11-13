# accept,本体側名

- **規格**: [accept.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/accept.md)
- **検索語**: accept
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `accept` キーをパースし、受け入れベースウェア判定を行う実装が行われている。

## 実装箇所

- `crates/nanai-core/src/descript_parser.rs:80` `if let Some(val) = self.get("install.accept") {`
- `src-tauri/src/commands/install/archive/inspection/tests.rs:65` `map.insert("accept".to_string(), "Nanai".to_string());`
- `ui/ts/ui/modal-ghost-handlers.ts:97` `hiddenInput.accept = ".nar,.zip";`
- `tests/install-update-protocol.test.ts:76` `const refuseArgs = buildInstallRefuseArgs("accept failed", "OtherGhost");`
- `crates/nanai-core/src/descript_parser.rs:230` `let content = "title,Emily Ghost\nsakura.name,Sakura\nkero.name,Kero\nshiori.ver`
- `src-tauri/src/commands/install/archive/inspection/tests.rs:79` `assert_eq!(map.get("accept").map(|s| s.as_str()), Some("Nanai"));`
