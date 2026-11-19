# sstp.allowunspecifiedsend,数値

- **規格**: [sstp.allowunspecifiedsend.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/sstp.allowunspecifiedsend.md)
- **検索語**: sstp.allowunspecifiedsend
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/sstp/handler/request_processor.rs` および `src-tauri/src/ghost/scan/directory/manifest/parser.rs` において `sstp.allowunspecifiedsend` ディレクティブのパースおよび無指定 SEND リクエスト拒否・許可判定が完全実装済み。

## 実装箇所

- `src-tauri/src/ghost/scan/directory/manifest/parser.rs` (`sstp.allowunspecifiedsend`)
- `src-tauri/src/sstp/handler/request_processor.rs` (`sstp.allowunspecifiedsend`)
