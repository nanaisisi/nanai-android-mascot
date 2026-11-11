# cursorブレス記述例

- **規格**: [introduction_cursorbrace.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/cursor-brace/introduction_cursorbrace/) (ukadoc-spec/descript/shell-surfaces/cursor-brace/introduction_cursorbrace.md)
- **検索語**: cursor
- **対応状況**: ⚠️ 一部対応

## 突合結果

ui/js/surface/surface-load.js の loadSurfacesTxt において surfaces.txt ファイル・エイリアス・アニメーション・衝突判定定義をパース・解決する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/install/utils.rs:154` `let mut cursor = std::io::Cursor::new(content);`
- `src-tauri/src/commands/install/utils.rs:155` `let map = parse_zip_entry_descript(&mut cursor);`
- `src-tauri/src/commands/install/utils.rs:166` `let mut cursor = std::io::Cursor::new(empty);`
- `src-tauri/src/commands/install/utils.rs:167` `let map = parse_zip_entry_descript(&mut cursor);`
- `src-tauri/src/shiori/dynamic/host.rs:207` `let mut cursor = Cursor::new(data);`
