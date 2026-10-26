# homeurl,URL

- **規格**: [homeurl.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/homeurl/) (ukadoc-spec/descript/shell/descript-txt/homeurl.md)
- **検索語**: homeurl
- **対応状況**: ⚠️ 一部対応(読込のみ)

## 突合結果

ghost/scan.rs 等で descript の値を読込している。表示・動作への反映は個別未確認。

## 実装箇所

- `src-tauri/src/commands/update/network.rs:38`  `let homeurl = get_ghost_homeurl(&ghost_dir).ok_or_else(|| {`
- `src-tauri/src/commands/update/network.rs:40`  `"ゴースト「{}」に homeurl が設定されていません",`
- `src-tauri/src/commands/update/network.rs:53`  `let url_dau = format!("{}updates2.dau", homeurl);`
- `src-tauri/src/commands/update/network.rs:63`  `let url_txt = format!("{}updates.txt", homeurl);`
- `src-tauri/src/commands/update/network.rs:76`  `homeurl`
