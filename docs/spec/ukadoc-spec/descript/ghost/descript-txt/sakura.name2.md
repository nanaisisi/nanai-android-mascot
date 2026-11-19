# sakura.name2,名前

- **規格**: [sakura.name2.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/sakura.name2.md)
- **検索語**: sakura.name2
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/ghost/scan/directory/manifest/parser.rs` および `crates/nanai-core/src/descript_parser/types.rs` において本体（\0）別名/サブ表示名 `sakura.name2` のパースおよび `sakura.name` フォールバックバインドが完全実装済み。

## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs` (`sakura_name`)
- `src-tauri/src/ghost/scan/directory/manifest/parser.rs` (`sakura.name2`)
