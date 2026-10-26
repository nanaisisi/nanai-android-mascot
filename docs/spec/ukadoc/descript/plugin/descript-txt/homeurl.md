# homeurl,URL

- **規格**: [homeurl.md](https://ukatech.shillest.net/ukadoc-spec/descript/plugin/descript-txt/homeurl/) (ukadoc-spec/descript/plugin/descript-txt/homeurl.md)
- **検索語**: homeurl
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「homeurl」が出現。実際の処理内容は未精査。

## 実装箇所

- `src-tauri/src/commands/update/network.rs:38`  `let homeurl = get_ghost_homeurl(&ghost_dir).ok_or_else(|| {`
- `src-tauri/src/commands/update/network.rs:40`  `"ゴースト「{}」に homeurl が設定されていません",`
- `src-tauri/src/commands/update/network.rs:53`  `let url_dau = format!("{}updates2.dau", homeurl);`
- `src-tauri/src/commands/update/network.rs:63`  `let url_txt = format!("{}updates.txt", homeurl);`
- `src-tauri/src/commands/update/network.rs:76`  `homeurl`
