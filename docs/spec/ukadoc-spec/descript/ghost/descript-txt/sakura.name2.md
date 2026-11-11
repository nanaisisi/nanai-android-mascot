# sakura.name2,名前

- **規格**: [sakura.name2.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/sakura.name2.md)
- **検索語**: sakura.name2
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `sakura.name2` キーをパース（`sakura.name` のフォールバック）し、本体（\0）表示名へ設定する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory/manifest.rs:61` `.or_else(|| m.get("sakura.name2").cloned())`
- `crates/ui/src/descript/tests.rs:56` `sakura.name2,SakuraSub\n\`
- `crates/ui/src/descript/parser/queries.rs:80` `/// さくら（本体）の正式名とサブ表示名（`sakura.name`, `sakura.name2`）`
- `crates/ui/src/descript/parser/queries.rs:82` `(self.get("sakura.name"), self.get("sakura.name2"))`
