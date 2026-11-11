# descriptブレス記述例

- **規格**: [introduction_descriptbrace.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/descript-brace/introduction_descriptbrace/) (ukadoc-spec/descript/shell-surfaces/descript-brace/introduction_descriptbrace.md)
- **検索語**: descript
- **対応状況**: ⚠️ 一部対応

## 突合結果

`ui/js/surface/surface-load.js` の `loadSurfacesTxt` において `surfaces.txt` ファイル・エイリアス・アニメーション・衝突判定定義をパース・解決する実装が行われている。

## 実装箇所

- `src-tauri/src/tray.rs:85` `let descript_path = ghost_master_dir.join("descript.txt");`
- `src-tauri/src/commands/ext.rs:31` `let desc_path = path.join("descript.txt");`
- `src-tauri/src/commands/ext.rs:96` `let desc_path = path.join("descript.txt");`
- `src-tauri/src/commands/install/archive/packaging.rs:141` `ghost_dir.join("descript.txt"),`
- `src-tauri/src/commands/install/archive/packaging.rs:155` `assert!(zip.by_name("ghost/master/descript.txt").is_ok());`
