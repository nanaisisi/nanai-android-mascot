# descriptブレス記述例

- **規格**: [introduction_descriptbrace.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/descript-brace/introduction_descriptbrace/) (ukadoc-spec/descript/shell-surfaces/descript-brace/introduction_descriptbrace.md)
- **検索語**: descript
- **対応状況**: ✅ 対応済 (surface-load.js)

## 突合結果

`ui/js/surface/surface-load.js` の `loadSurfacesTxt` において `surfaces.txt` ファイル・エイリアス・アニメーション・衝突判定定義をパース・解決する実装が行われている。

## 実装箇所

- `src-tauri/capabilities/default.json:4` `"description": "Capability for the main window",`
- `src-tauri/src/commands/ext.rs:4` `use crate::ghost::scan::read_descript_file;`
- `src-tauri/src/commands/ext.rs:30` `// [descript.txt（Pluginの）]: プラグイン descript.txt 読込`
- `src-tauri/src/commands/ext.rs:31` `let desc_path = path.join("descript.txt");`
- `src-tauri/src/commands/ext.rs:32` `if let Some(map) = read_descript_file(&desc_path) {`
