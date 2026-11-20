# sstp.allowunspecifiedsend,数値

- **規格**: [sstp.allowunspecifiedsend.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/sstp.allowunspecifiedsend.md)
- **検索語**: sstp.allowunspecifiedsend
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/sstp/handler/request_processor.rs` および `src-tauri/src/ghost/scan/directory/manifest/parser.rs` において `sstp.allowunspecifiedsend` ディレクティブのパースおよび無指定 SEND リクエスト拒否・許可判定が完全実装済み。

## 実装箇所

- `crates/ui/src/sstp/config/ghost_config.rs:9` `/// [sstp.allowcommunicate], [sstp.allowunspecifiedsend], [sstp.alwaystranslate]`
- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:150` `.and_then(|m| m.get("sstp.allowunspecifiedsend"))`
- `crates/ui/src/sstp/config/ghost_config.rs:15` `/// sstp.allowunspecifiedsend: 0 でゴーストを指名しない SSTP を受けない。デフォルトは 1`
- `src-tauri/src/sstp/mod.rs:68` `map.insert("sstp.allowunspecifiedsend".to_string(), "0".to_string());`
- `crates/ui/src/sstp/config/ghost_config.rs:67` `.get("sstp.allowunspecifiedsend")`
- `src-tauri/src/sstp/parser.rs:72` `/// Parse raw SSTP text with ghost-specific SSTP configuration [sstp.allowcommun`
