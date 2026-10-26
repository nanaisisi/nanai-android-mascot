# sakura.name,名前

- **規格**: [sakura.name.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/sakura.name/) (ukadoc-spec/descript/shell/descript-txt/sakura.name.md)
- **検索語**: sakura.name
- **対応状況**: ⚠️ 一部対応(読込のみ)

## 突合結果

ghost/scan.rs 等で descript の値を読込している。表示・動作への反映は個別未確認。

## 実装箇所

- `src-tauri/src/ghost/scan.rs:191`  `.and_then(|m| m.get("sakura.name").cloned());`
- `crates/ui/src/lib.rs:26`  `"charset,Shift_JIS\r\nname,SampleGhost\r\nsakura.name,Nanai\r\nkero.name,Mini\r\n";`
- `src-tauri/src/commands/install.rs:162`  `.and_then(|m| m.get("sakura.name").cloned());`
- `crates/ui/src/descript.rs:35` (コメント) `/// キャラクター本体名（kero.name または sakura.name）`
- `crates/ui/src/descript.rs:37`  `self.get("sakura.name")`
