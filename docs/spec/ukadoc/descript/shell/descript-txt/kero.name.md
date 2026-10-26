# kero.name,名前

- **規格**: [kero.name.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/kero.name/) (ukadoc-spec/descript/shell/descript-txt/kero.name.md)
- **検索語**: kero.name
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「kero.name」が出現。実際の処理内容は未精査。

## 実装箇所

- `src-tauri/src/ghost/scan.rs:192`  `let kero_name = meta_map.as_ref().and_then(|m| m.get("kero.name").cloned());`
- `crates/ui/src/lib.rs:26`  `"charset,Shift_JIS\r\nname,SampleGhost\r\nsakura.name,Nanai\r\nkero.name,Mini\r\n";`
- `src-tauri/src/commands/install.rs:163`  `let kero_name = meta_map.as_ref().and_then(|m| m.get("kero.name").cloned());`
- `ui/js/surface/ghost-surface.js:164` (コメント) `// ゴースト側に kero.name 等のサブキャラ設定が存在する場合のみ、またはスクリプトからの明示呼び出し時にサブウィンドウで表示`
- `crates/ui/src/descript.rs:35` (コメント) `/// キャラクター本体名（kero.name または sakura.name）`
