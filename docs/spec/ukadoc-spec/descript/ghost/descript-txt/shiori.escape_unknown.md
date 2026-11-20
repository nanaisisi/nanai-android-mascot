# shiori.escape_unknown,0/1

- **規格**: [shiori.escape_unknown.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/shiori.escape_unknown.md)
- **検索語**: shiori.escape_unknown
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/directory/manifest/parser.rs` において `shiori.escape_unknown` キーのパースおよび制御参照が完全実装済み。

## 実装箇所

- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:127` `.and_then(|m| m.get("shiori.escape_unknown").cloned());`
