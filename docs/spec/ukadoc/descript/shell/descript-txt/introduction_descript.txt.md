# descript.txt（Shellの）

- **規格**: [introduction_descript.txt.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/introduction_descript.txt/) (ukadoc-spec/descript/shell/descript-txt/introduction_descript.txt.md)
- **検索語**: descript.txt
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「descript.txt」が出現。実際の処理内容は未精査。

## 実装箇所

- `src-tauri/src/ghost/scan.rs:21` (コメント) `/// descript.txt の内容をパース（Shift_JIS / UTF-8 両対応）`
- `src-tauri/src/ghost/scan.rs:68`  `let descript_path = path.join("descript.txt");`
- `src-tauri/src/ghost/scan.rs:170` (コメント) `// ghost/master/descript.txt または descript.txt`
- `src-tauri/src/ghost/scan.rs:172`  `path.join("ghost").join("master").join("descript.txt"),`
- `src-tauri/src/ghost/scan.rs:173`  `path.join("descript.txt"),`
