# don't need onmousemove,数値

- **規格**: [don-t.md](../../../../../ukadoc-spec/descript/shell/descript-txt/don-t.md)
- **検索語**: don't need onmousemove
- **対応状況**: ⚠️ 一部対応

## 突合結果

未確認・未実装。


## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs:284` `self.get("don't need onmousemove")`
- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:168` `.and_then(|m| m.get("don't need onmousemove"))`
- `src-tauri/src/ghost/scan/directory/manifest/tests.rs:71` `don't need onmousemove,1\r\n\`
