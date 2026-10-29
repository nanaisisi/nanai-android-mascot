# readme,ファイル名

- **規格**: [readme.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/readme.md)
- **検索語**: readme
- **対応状況**: ✅ 対応済

## 突合結果

インストール時やオーナードローメニューから開かれるゴーストの説明テキストファイル名。
`src-tauri/src/ghost/scan/directory.rs` においてゴーストの `descript.txt` 内の `readme` キーをパースし、情報を読み込む実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs` `// [readme,ファイル名], [readme.charset,文字コード]...`
