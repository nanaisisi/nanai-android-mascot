# sakura.name,名前

- **規格**: [sakura.name.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/sakura.name/) (ukadoc-spec/descript/shell/descript-txt/sakura.name.md)
- **検索語**: sakura.name
- **対応状況**: ⚠️ 一部対応(読込のみ)

## 突合結果

ghost/scan.rs 等で descript の値を読込している。表示・動作への反映は個別未確認。

## 実装箇所

- `src-tauri/src/commands/install/archive/postprocess.rs:52` `.and_then(|m| m.get("sakura.name").cloned());`
- `src-tauri/src/ghost/scan/directory/manifest.rs:39` `m.get("sakura.name")`
- `src-tauri/src/ghost/scan/directory/manifest.rs:41` `.or_else(|| m.get("sakura.name2").cloned())`
- `crates/ui/src/lib.rs:49` `let sample = "charset,Shift_JIS\r\nname,SampleGhost\r\nsakura.name,Nanai\r\nkero`
- `crates/ui/src/descript/parser.rs:56` `/// キャラクター本体名（`kero.name` または `sakura.name`）`
