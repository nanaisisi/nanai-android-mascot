# char*.defaultleft,X座標

- **規格**: [char-star-.defaultleft.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/char-star-.defaultleft.md)
- **検索語**: char*.defaultleft
- **対応状況**: ⚠️ 一部対応

## 突合結果

`crates/nanai-core/src/descript_parser/types.rs` の `DescriptManifest::char_default_pos(index)` において `char{N}.defaultleft` 座標キーのパースおよび取得が完全実装済み。

## 実装箇所

- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:99` `// char0.defaultx char0.defaulty char0.defaultleft char0.defaulttop char0.balloo`
