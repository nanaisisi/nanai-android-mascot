# descriptブレス記述例

- **規格**: [introduction_descriptbrace.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/descript-brace/introduction_descriptbrace/) (ukadoc-spec/descript/shell-surfaces/descript-brace/introduction_descriptbrace.md)
- **検索語**: descript
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「descript」が出現。実際の処理内容は未精査。

## 実装箇所

- `src-tauri/src/ghost/scan.rs:21` (コメント) `/// descript.txt の内容をパース（Shift_JIS / UTF-8 両対応）`
- `src-tauri/src/ghost/scan.rs:22`  `pub fn read_descript_file(file_path: &Path) -> Option<std::collections::HashMap<String, St`
- `src-tauri/src/ghost/scan.rs:68`  `let descript_path = path.join("descript.txt");`
- `src-tauri/src/ghost/scan.rs:69`  `if let Some(map) = read_descript_file(&descript_path) {`
- `src-tauri/src/ghost/scan.rs:170` (コメント) `// ghost/master/descript.txt または descript.txt`
