# font.name,フォント名

- **規格**: [font.name.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.name.md)
- **検索語**: font.name
- **対応状況**: ✅ 対応済

## 突合結果

`app-actions.js` の `applyBalloonDescript()` において `props["font.name"]` を取得し、文書のルート要素に対して `--balloon-font-family: \`"${props["font.name"]}", Meiryo, sans-serif\`` カスタムプロパティとして動的バインドされる実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:193` `// [menu.font.name,フォント名], [menu.font.height,フォントサイズ]:`
- `src-tauri/src/ghost/scan/directory.rs:194` `let _menu_font_name = m.get("menu.font.name");`
- `src-tauri/src/ghost/scan/shell.rs:136` `// [menu.font.name,フォント名], [menu.font.height,フォントサイズ]:`
- `src-tauri/src/ghost/scan/shell.rs:137` `let _menu_font_name = merged.get("menu.font.name");`
- `ui/js/core/actions/balloon-descript/font.js:13` `// [font.name,フォント名]: props["font.name"]`
