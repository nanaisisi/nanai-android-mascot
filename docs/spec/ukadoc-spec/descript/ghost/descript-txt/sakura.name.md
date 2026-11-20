# sakura.name,名前

- **規格**: [sakura.name.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/sakura.name.md)
- **検索語**: sakura.name
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/directory/manifest/parser.rs` および `crates/nanai-core/src/descript_parser/types.rs` において本体（\0）表示名 `sakura.name` のパースおよび `GhostInfo.sakura_name` へのバインドが完全実装済み。

## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs:56` `/// 桜側キャラクター名 (`sakura.name`)`
- `src-tauri/src/commands/install/archive/mod.rs:118` `for key in ["name", "sakura.name"] {`
- `crates/nanai-core/src/descript_parser/types.rs:58` `self.get("sakura.name")`
- `src-tauri/src/commands/install/archive/mod.rs:180` `// Case-insensitive match on sakura.name`
- `crates/ui/src/descript/tests.rs:54` `sakura.name,Sakura\n\`
- `src-tauri/src/commands/install/archive/postprocess.rs:117` `.and_then(|m| m.get("sakura.name").cloned());`
