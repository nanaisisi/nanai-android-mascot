# descriptブレス記述例

- **規格**: [introduction_descriptbrace.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/descript-brace/introduction_descriptbrace/) (ukadoc-spec/descript/shell-surfaces/descript-brace/introduction_descriptbrace.md)
- **検索語**: descript
- **対応状況**: ⚠️ 一部対応 (Rust パーサー `crates/ui/src/surfaces.rs` で解析・データ化実装済 / 描画・実行への反映は別レイヤー)

## 突合結果

ヒットしたのは一般的な語「descript」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所
- `crates/ui/src/surfaces.rs` （Rust 版 surfaces.txt パーサー：Element / Collision / SERIKO / Alias / append の解析）

- `src-tauri/src/ghost/scan.rs:21` (コメント) `/// descript.txt の内容をパース（Shift_JIS / UTF-8 両対応）`
- `src-tauri/src/ghost/scan.rs:22`  `pub fn read_descript_file(file_path: &Path) -> Option<std::collections::HashMap<String, St`
- `src-tauri/src/ghost/scan.rs:68`  `let descript_path = path.join("descript.txt");`
- `src-tauri/src/ghost/scan.rs:69`  `if let Some(map) = read_descript_file(&descript_path) {`
- `src-tauri/src/ghost/scan.rs:170` (コメント) `// ghost/master/descript.txt または descript.txt`
