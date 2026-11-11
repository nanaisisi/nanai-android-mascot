# sstp.allowcommunicate,数値

- **規格**: [sstp.allowcommunicate.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/sstp.allowcommunicate.md)
- **検索語**: sstp.allowcommunicate
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `sstp.allowcommunicate` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory/manifest.rs:174` `.and_then(|m| m.get("sstp.allowcommunicate"))`
- `src-tauri/src/sstp/mod.rs:67` `map.insert("sstp.allowcommunicate".to_string(), "0".to_string());`
- `src-tauri/src/sstp/parser.rs:72` `/// Parse raw SSTP text with ghost-specific SSTP configuration [sstp.allowcommun`
- `src-tauri/src/sstp/handler/request_processor.rs:17` `/// Send SSTP request with ghost configuration validation ([sstp.allowcommunicat`
- `src-tauri/src/sstp/handler/request_processor.rs:29` `// [sstp.allowcommunicate]: COMMUNICATE メソッド拒否判定`
