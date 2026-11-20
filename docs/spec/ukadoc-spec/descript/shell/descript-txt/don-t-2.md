# don't need bind,数値

- **規格**: [don-t-2.md](../../../../../ukadoc-spec/descript/shell/descript-txt/don-t-2.md)
- **検索語**: don't need bind
- **対応状況**: ⚠️ 一部対応

## 突合結果

未確認・未実装。


## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs:291` `self.get("don't need bind")`
- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:174` `.and_then(|m| m.get("don't need bind"))`
- `src-tauri/src/ghost/scan/directory/manifest/tests.rs:72` `don't need bind,1\r\n\`
