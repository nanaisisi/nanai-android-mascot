# shiori.logo.file,ファイル名

- **規格**: [shiori.logo.file.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/shiori.logo.file.md)
- **検索語**: shiori.logo.file
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/directory/manifest/parser.rs` において `shiori.logo.file` キーのパースおよびロゴ画像ファイル指定処理が完全実装済み。

## 実装箇所

- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:130` `.and_then(|m| m.get("shiori.logo.file").cloned());`
