# don't need seriko talk,数値

- **規格**: [don-t-3.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/don-t-3.md)
- **検索語**: don't need seriko talk
- **対応状況**: ⚠️ 一部対応

## 突合結果

`crates/nanai-core/src/descript_parser/types.rs` の `dont_need_seriko_talk()` において `don't need seriko talk` ディレクティブのパースおよび評価が完全実装済み。

## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs:298` `self.get("don't need seriko talk")`
- `src-tauri/src/ghost/scan/directory/manifest/parser.rs` `dont_need_seriko_talk`
- `src-tauri/src/common/models/ghost.rs` `GhostInfo::dont_need_seriko_talk`
