# install.txt

- **規格**: [introduction_install.txt.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/introduction_install.txt/) (ukadoc-spec/descript/install/install-txt/introduction_install.txt.md)
- **検索語**: install.txt
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「install.txt」が出現。実際の処理内容は未精査。

## 実装箇所

- `ui/js/ui/templates/ghost-templates.js:71`  `<li><strong>install.txt 自動解析:</strong> ゴースト名・ディレクトリ設定を自動認識</li>`
- `src-tauri/src/ghost/scan.rs:174`  `path.join("install.txt"),`
- `src-tauri/src/commands/install.rs:14` (コメント) `// アーカイブ内のinstall.txtまたはdescript.txtを検索してゴースト名を特定`
- `src-tauri/src/commands/install.rs:29`  `if lower.ends_with("install.txt") || lower.ends_with("descript.txt") {`
- `src-tauri/src/commands/install.rs:62`  `if lower.ends_with("install.txt") {`
