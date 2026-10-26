# craftman,作者名

- **規格**: [craftman.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/craftman/) (ukadoc-spec/descript/ghost/descript-txt/craftman.md)
- **検索語**: craftman
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「craftman」が出現。実際の処理内容は未精査。

## 実装箇所

- `src-tauri/src/ghost/scan.rs:194`  `let craftman = meta_map.as_ref().and_then(|m| m.get("craftman").cloned());`
- `src-tauri/src/ghost/scan.rs:195`  `let craftman_url = meta_map`
- `src-tauri/src/ghost/scan.rs:197`  `.and_then(|m| m.get("craftmanurl").cloned());`
- `src-tauri/src/ghost/scan.rs:208`  `craftman,`
- `src-tauri/src/ghost/scan.rs:209`  `craftman_url,`
