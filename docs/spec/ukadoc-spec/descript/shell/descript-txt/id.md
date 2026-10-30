# id,ID名

- **規格**: [id.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/id/) (ukadoc-spec/descript/shell/descript-txt/id.md)
- **検索語**: id,ID名
- **対応状況**: ✅ 対応済 (shell.rs)\n\n## 突合結果\n\nsrc-tauri/src/ghost/scan/shell.rs においてパース・抽出・バインドする実装が行われている。\n\n## 実装箇所

- `src-tauri/src/commands/ext.rs:33` `// [name,プラグイン名], [id,ID名], [type,種別], [filename,ファイル名]:`
- `src-tauri/src/commands/ext.rs:92` `// [name,ヘッドライン名], [id,ID名], [type,種別]:`
- `src-tauri/src/ghost/scan/directory.rs:109` `// [shiori,ファイル名], [craftman,作者名], [craftmanw,作者名], [craftmanurl,URL], [homeurl,`
- `src-tauri/src/ghost/scan/shell.rs:83` `// [name,シェル名], [type,種別], [id,ID名], [charset,文字コード], [craftman,作者名], [craftmanw`
- `ui/js/core/actions/balloon-descript/font.js:10` `// [id,ID名]: props["id"]`
