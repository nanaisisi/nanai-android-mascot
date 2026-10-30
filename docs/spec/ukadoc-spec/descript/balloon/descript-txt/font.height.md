# font.height,数値

- **規格**: [font.height.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.height.md)
- **検索語**: font.height
- **対応状況**: ✅ 対応済

## 突合結果

`app-actions.js` の `applyBalloonDescript()` において `props["font.height"]` をパースし、文書のルート要素に対して `--balloon-font-size: \`${fh}px\`` カスタムプロパティとして動的バインドされる実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:193` `// [menu.font.name,フォント名], [menu.font.height,フォントサイズ]:`
- `src-tauri/src/ghost/scan/directory.rs:195` `let _menu_font_height = m.get("menu.font.height");`
- `src-tauri/src/ghost/scan/shell.rs:136` `// [menu.font.name,フォント名], [menu.font.height,フォントサイズ]:`
- `src-tauri/src/ghost/scan/shell.rs:138` `let _menu_font_height = merged.get("menu.font.height");`
- `ui/js/core/actions/balloon-descript/font.js:21` `// [font.height,数値]: props["font.height"]`
