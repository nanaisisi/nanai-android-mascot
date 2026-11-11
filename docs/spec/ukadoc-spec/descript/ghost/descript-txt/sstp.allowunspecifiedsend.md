# sstp.allowunspecifiedsend,数値

- **規格**: [sstp.allowunspecifiedsend.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/sstp.allowunspecifiedsend.md)
- **検索語**: sstp.allowunspecifiedsend
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `sstp.allowunspecifiedsend` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory/manifest.rs:180` `.and_then(|m| m.get("sstp.allowunspecifiedsend"))`
- `src-tauri/src/sstp/mod.rs:68` `map.insert("sstp.allowunspecifiedsend".to_string(), "0".to_string());`
- `src-tauri/src/sstp/parser.rs:72` `/// Parse raw SSTP text with ghost-specific SSTP configuration [sstp.allowcommun`
- `src-tauri/src/sstp/handler/request_processor.rs:17` `/// Send SSTP request with ghost configuration validation ([sstp.allowcommunicat`
- `src-tauri/src/sstp/handler/request_processor.rs:69` `// [sstp.allowunspecifiedsend]: 無指定 SEND 拒否判定`
