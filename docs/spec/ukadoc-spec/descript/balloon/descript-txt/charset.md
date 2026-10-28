# charset,文字コード

- **規格**: [charset.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/descript-txt/charset/) (ukadoc-spec/descript/balloon/descript-txt/charset.md)
- **検索語**: charset
- **対応状況**: ✅ 対応済

## 突合結果

バックエンドの `read_descript_file` およびファイルパーサ（`descript.rs`）において、Shift_JIS（CP932）と UTF-8 の自動判別デコード（`encoding_rs::SHIFT_JIS`）による透過的な文字コード処理が実装されている。
