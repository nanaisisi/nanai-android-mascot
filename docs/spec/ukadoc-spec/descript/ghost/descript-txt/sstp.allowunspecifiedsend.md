# sstp.allowunspecifiedsend,数値

- **規格**: [sstp.allowunspecifiedsend.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/sstp.allowunspecifiedsend.md)
- **検索語**: sstp.allowunspecifiedsend
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `sstp.allowunspecifiedsend` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:190` `// [sstp.allowcommunicate,数値], [sstp.allowunspecifiedsend,数値], [sstp.alwaystrans`
- `src-tauri/src/ghost/scan/directory.rs:192` `let _sstp_unspec = m.get("sstp.allowunspecifiedsend");`
