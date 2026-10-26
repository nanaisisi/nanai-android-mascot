# sakura.name,名前

- **規格**: [sakura.name.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/sakura.name/) (ukadoc-spec/descript/ghost/descript-txt/sakura.name.md)
- **検索語**: sakura.name
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「sakura.name」が出現。実際の処理内容は未精査。

## 実装箇所

- `src-tauri/src/ghost/scan.rs:191`  `.and_then(|m| m.get("sakura.name").cloned());`
- `crates/ui/src/lib.rs:26`  `"charset,Shift_JIS\r\nname,SampleGhost\r\nsakura.name,Nanai\r\nkero.name,Mini\r\n";`
- `src-tauri/src/commands/install.rs:162`  `.and_then(|m| m.get("sakura.name").cloned());`
- `crates/ui/src/descript.rs:35` (コメント) `/// キャラクター本体名（kero.name または sakura.name）`
- `crates/ui/src/descript.rs:37`  `self.get("sakura.name")`
