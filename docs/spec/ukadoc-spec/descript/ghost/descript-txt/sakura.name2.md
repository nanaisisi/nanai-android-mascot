# sakura.name2,名前

- **規格**: [sakura.name2.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/sakura.name2.md)
- **検索語**: sakura.name2
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `sakura.name2` キーをパース（`sakura.name` のフォールバック）し、本体（\0）表示名へ設定する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/shell.rs:91` `// [sakura.name,名前], [sakura.name2,名前], [kero.name,名前], [char*.name,名前]:`
- `src-tauri/src/ghost/scan/directory/manifest.rs:41` `.or_else(|| m.get("sakura.name2").cloned())`
- `crates/ui/src/descript/parser.rs:111` `/// さくら（本体）の正式名とサブ表示名（`sakura.name`, `sakura.name2`）`
- `crates/ui/src/descript/parser.rs:113` `(self.get("sakura.name"), self.get("sakura.name2"))`
- `crates/ui/src/descript/tests.rs:56` `sakura.name2,SakuraSub\n\`
