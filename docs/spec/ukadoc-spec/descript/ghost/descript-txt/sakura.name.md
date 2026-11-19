# sakura.name,名前

- **規格**: [sakura.name.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/sakura.name.md)
- **検索語**: sakura.name
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/ghost/scan/directory/manifest/parser.rs` および `crates/nanai-core/src/descript_parser/types.rs` において本体（\0）表示名 `sakura.name` のパースおよび `GhostInfo.sakura_name` へのバインドが完全実装済み。

## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs` (`sakura_name`)
- `src-tauri/src/ghost/scan/directory/manifest/parser.rs` (`sakura.name`)
