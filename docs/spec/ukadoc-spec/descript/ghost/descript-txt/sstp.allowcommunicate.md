# sstp.allowcommunicate,数値

- **規格**: [sstp.allowcommunicate.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/sstp.allowcommunicate.md)
- **検索語**: sstp.allowcommunicate
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/sstp/handler/request_processor.rs` および `crates/nanai-core/src/descript_parser/types.rs` (`is_sstp_communicate_allowed()`) において `sstp.allowcommunicate` ディレクティブのパースおよび COMMUNICATE リクエスト拒否・許可判定が完全実装済み。

## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs:237` `/// SSTP COMMUNICATE 許可判定 (`sstp.allowcommunicate`)`
- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:144` `.and_then(|m| m.get("sstp.allowcommunicate"))`
- `crates/nanai-core/src/descript_parser/types.rs:239` `self.get("sstp.allowcommunicate")`
- `src-tauri/src/sstp/mod.rs:67` `map.insert("sstp.allowcommunicate".to_string(), "0".to_string());`
- `crates/ui/src/sstp/config/ghost_config.rs:9` `/// [sstp.allowcommunicate], [sstp.allowunspecifiedsend], [sstp.alwaystranslate]`
- `src-tauri/src/sstp/parser.rs:72` `/// Parse raw SSTP text with ghost-specific SSTP configuration [sstp.allowcommun`
