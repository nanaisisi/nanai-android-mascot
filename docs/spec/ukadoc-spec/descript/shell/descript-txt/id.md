# id,ID名

- **規格**: [id.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/id/) (ukadoc-spec/descript/shell/descript-txt/id.md)
- **検索語**: id,ID名
- **対応状況**: ✅ 対応済 (shell.rs)\n\n## 突合結果\n\nsrc-tauri/src/ghost/scan/shell.rs においてパース・抽出・バインドする実装が行われている。\n\n## 実装箇所

- `src-tauri/src/commands/ext.rs:33` `// [name,プラグイン名], [id,ID名], [type,種別], [filename,ファイル名]:`
- `src-tauri/src/commands/ext.rs:98` `// [name,ヘッドライン名], [id,ID名], [type,種別]:`
