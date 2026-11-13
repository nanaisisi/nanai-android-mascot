# sakura.seriko.alignmenttodesktop,位置情報

- **規格**: [sakura.seriko.alignmenttodesktop.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/sakura.seriko.alignmenttodesktop.md)
- **検索語**: sakura.seriko.alignmenttodesktop
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `sakura.seriko.alignmenttodesktop` キーをパース・参照する実装が行われている。

## 実装箇所

- `crates/nanai-core/src/descript_parser.rs:196` `.or_else(|| self.get("sakura.seriko.alignmenttodesktop"))`
