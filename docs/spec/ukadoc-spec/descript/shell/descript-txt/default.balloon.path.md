# default.balloon.path,パス

- **規格**: [default.balloon.path.md](../../../../../ukadoc-spec/descript/shell/descript-txt/default.balloon.path.md)
- **検索語**: default.balloon.path
- **対応状況**: ⚠️ 一部対応

## 突合結果

未確認・未実装。


## 実装箇所

- `src-tauri/src/commands/install/archive/postprocess.rs:136` `.and_then(|m| m.get("default.balloon.path").cloned());`
- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:79` `.and_then(|m| m.get("default.balloon.path").cloned());`
- `src-tauri/src/shiori/property/evaluator/mod.rs:70` `"default.balloon.path" => {`
