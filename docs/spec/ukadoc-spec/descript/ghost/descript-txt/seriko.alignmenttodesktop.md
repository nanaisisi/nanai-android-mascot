# seriko.alignmenttodesktop,位置情報

- **規格**: [seriko.alignmenttodesktop.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/seriko.alignmenttodesktop.md)
- **検索語**: seriko.alignmenttodesktop
- **対応状況**: ⚠️ 一部対応

## 突合結果

`crates/nanai-core/src/descript_parser/types.rs` の `alignment_to_desktop()` において `seriko.alignmenttodesktop` ディレクティブのパースおよび取得が完全実装済み。

## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs:220` `/// デスクトップ位置揃え設定 (`seriko.alignmenttodesktop`, `sakura.seriko.alignmenttodesktop`
- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:98` `// [char*.seriko.alignmenttodesktop,位置情報], [char*.seriko.defaultsurface,数値], [ch`
- `crates/nanai-core/src/descript_parser/types.rs:222` `self.get("seriko.alignmenttodesktop")`
- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:99` `// char0.defaultx char0.defaulty char0.defaultleft char0.defaulttop char0.balloo`
- `crates/nanai-core/src/descript_parser/types.rs:223` `.or_else(|| self.get("sakura.seriko.alignmenttodesktop"))`
- `crates/nanai-core/src/descript_parser/types.rs:224` `.or_else(|| self.get("kero.seriko.alignmenttodesktop"))`
