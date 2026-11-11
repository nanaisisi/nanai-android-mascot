# sakura.name2,名前

- **規格**: [sakura.name2.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/sakura.name2/) (ukadoc-spec/descript/shell/descript-txt/sakura.name2.md)
- **検索語**: sakura.name2
- **対応状況**: ⚠️ 一部対応

## 突合結果

実装コードに「sakura.name2」が見つからない。

## 実装箇所

- `src-tauri/src/ghost/scan/directory/manifest.rs:61` `.or_else(|| m.get("sakura.name2").cloned())`
- `crates/ui/src/descript/tests.rs:56` `sakura.name2,SakuraSub\n\`
- `crates/ui/src/descript/parser/queries.rs:80` `/// さくら（本体）の正式名とサブ表示名（`sakura.name`, `sakura.name2`）`
- `crates/ui/src/descript/parser/queries.rs:82` `(self.get("sakura.name"), self.get("sakura.name2"))`
