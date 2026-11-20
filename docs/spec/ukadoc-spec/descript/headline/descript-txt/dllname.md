# dllname,ファイル名

- **規格**: [dllname.md](https://ukatech.shillest.net/ukadoc-spec/descript/headline/descript-txt/) (ukadoc-spec/descript/headline/descript-txt/dllname.md)
- **検索語**: dllname
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/commands/ext.rs` においてヘッドラインの `descript.txt` 内の `dllname` ディレクティブのパースおよび保持が完全実装済み。

## 実装箇所

- `src-tauri/src/commands/ext.rs:121` `let _dllname = map.get("dllname");`
