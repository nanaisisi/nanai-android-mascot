# char*.seriko.alignmenttodesktop,位置情報

- **規格**: [char-star-.seriko.alignmenttodesktop.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/char-star-.seriko.alignmenttodesktop.md)
- **検索語**: char*.seriko.alignmenttodesktop
- **対応状況**: ⚠️ 一部対応

## 突合結果

`crates/nanai-core/src/descript_parser/types.rs` の `DescriptManifest::char_alignment_to_desktop(index)` において `char{N}.seriko.alignmenttodesktop` のパースおよび取得が完全実装済み。

## 実装箇所

- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:99` `// char0.defaultx char0.defaulty char0.defaultleft char0.defaulttop char0.balloo`
