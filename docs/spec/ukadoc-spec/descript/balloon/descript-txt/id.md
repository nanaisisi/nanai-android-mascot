# id,ID名

- **規格**: [id.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/id.md)
- **検索語**: id,ID名
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `props["id"]` を検出し、`--balloon-id` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/ext.rs:33` `// [name,プラグイン名], [id,ID名], [type,種別], [filename,ファイル名]:`
- `src-tauri/src/commands/ext.rs:98` `// [name,ヘッドライン名], [id,ID名], [type,種別]:`
- `ui/js/core/actions/balloon-descript/font.js:10` `// [id,ID名]: props["id"]`
