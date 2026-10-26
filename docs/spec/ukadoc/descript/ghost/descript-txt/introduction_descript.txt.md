# descript.txt（Ghostの）

- **規格**: [introduction_descript.txt.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/introduction_descript.txt/) (ukadoc-spec/descript/ghost/descript-txt/introduction_descript.txt.md)
- **検索語**: descript.txt
- **対応状況**: ❌ 未実装(誤検出)

## 突合結果

ヒットしたのは一般的な語「descript.txt」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `src-tauri/src/ghost/scan.rs:21` (コメント) `/// descript.txt の内容をパース（Shift_JIS / UTF-8 両対応）`
- `src-tauri/src/ghost/scan.rs:68`  `let descript_path = path.join("descript.txt");`
- `src-tauri/src/ghost/scan.rs:170` (コメント) `// ghost/master/descript.txt または descript.txt`
- `src-tauri/src/ghost/scan.rs:172`  `path.join("ghost").join("master").join("descript.txt"),`
- `src-tauri/src/ghost/scan.rs:173`  `path.join("descript.txt"),`
