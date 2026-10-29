# readme,ファイル名

- **規格**: [readme.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/readme.md)
- **検索語**: readme
- **対応状況**: ❌ 検出なし

## 突合結果

実装コード内に「readme」を確認。


## 実装箇所

- `crates/ui/src/update.rs:91` `file,ghost\\master\\readme.txt,ABCDEF1234567890ABCDEF1234567890\r\n";`
- `crates/ui/src/update.rs:99` `assert_eq!(entries[1].path, "ghost/master/readme.txt");`
- `crates/ui/src/lib.rs:39` `if let Ok(content) = open_shift_jis_file("sample/readme.txt") {`
