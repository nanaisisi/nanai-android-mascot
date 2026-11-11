# sakura.name,名前

- **規格**: [sakura.name.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/sakura.name.md)
- **検索語**: sakura.name
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `sakura.name` キーをパースし、本体（\0）表示名 `GhostInfo.sakura_name` へ設定する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive/postprocess.rs:100` `.and_then(|m| m.get("sakura.name").cloned());`
- `src-tauri/src/ghost/scan/directory/manifest.rs:59` `m.get("sakura.name")`
- `crates/ui/src/descript/tests.rs:54` `sakura.name,Sakura\n\`
- `crates/ui/src/descript/parser/queries.rs:14` `/// キャラクター本体名（`kero.name` または `sakura.name`）`
- `crates/ui/src/descript/parser/queries.rs:16` `self.get("sakura.name")`
