# sstp.allowcommunicate,数値

- **規格**: [sstp.allowcommunicate.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/sstp.allowcommunicate.md)
- **検索語**: sstp.allowcommunicate
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/sstp/handler/request_processor.rs` および `crates/nanai-core/src/descript_parser/types.rs` (`is_sstp_communicate_allowed()`) において `sstp.allowcommunicate` ディレクティブのパースおよび COMMUNICATE リクエスト拒否・許可判定が完全実装済み。

## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs` (`is_sstp_communicate_allowed`)
- `src-tauri/src/ghost/scan/directory/manifest/parser.rs` (`sstp.allowcommunicate`)
- `src-tauri/src/sstp/handler/request_processor.rs` (`sstp.allowcommunicate`)
