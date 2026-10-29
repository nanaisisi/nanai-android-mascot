# charset,文字コード

- **規格**: [charset.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/charset.md)
- **検索語**: charset
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/descript.rs` の `read_descript_file()` において `charset,shift_jis` や `charset,sjis` ディレクティブを検出判別し、適切なエンコーディングデコード（Shift_JIS / UTF-8）を実行する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/descript.rs` `if utf8_str.to_lowercase().contains("charset,shift_jis")`
- `src-tauri/src/ghost/scan/directory.rs` `// [readme,ファイル名], [readme.charset,文字コード], [charset,文字コード]...`
