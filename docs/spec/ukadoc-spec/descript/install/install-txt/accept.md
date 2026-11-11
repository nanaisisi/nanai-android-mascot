# accept,本体側名

- **規格**: [accept.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/accept.md)
- **検索語**: accept
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `accept` キーをパースし、受け入れベースウェア判定を行う実装が行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive/inspection/tests.rs:65` `map.insert("accept".to_string(), "Nanai".to_string());`
- `src-tauri/src/commands/install/archive/inspection/tests.rs:79` `assert_eq!(map.get("accept").map(|s| s.as_str()), Some("Nanai"));`
- `src-tauri/src/commands/install/archive/inspection/types.rs:17` `pub accept: Option<String>,`
- `src-tauri/src/commands/install/archive/inspection/analyzer/zip_inspector.rs:43` `let mut accept: Option<String> = None;`
- `src-tauri/src/commands/install/archive/inspection/analyzer/zip_inspector.rs:67` `if let Some(val) = map.get("accept") {`
