# kero.seriko.alignmenttodesktop,位置情報

- **規格**: [kero.seriko.alignmenttodesktop.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/kero.seriko.alignmenttodesktop.md)
- **検索語**: kero.seriko.alignmenttodesktop
- **対応状況**: ⚠️ 一部対応

## 突合結果

`crates/nanai-core/src/descript_parser/types.rs` の `kero_alignment_to_desktop()` において `kero.seriko.alignmenttodesktop` ディレクティブのパースおよび取得が完全実装済み。

## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs:220` `/// デスクトップ位置揃え設定 (`seriko.alignmenttodesktop`, `sakura.seriko.alignmenttodesktop`
- `crates/nanai-core/src/descript_parser/types.rs:224` `.or_else(|| self.get("kero.seriko.alignmenttodesktop"))`
- `crates/nanai-core/src/descript_parser/types.rs:227` `/// Kero側デスクトップ位置揃え設定 (`kero.seriko.alignmenttodesktop`)`
- `crates/nanai-core/src/descript_parser/types.rs:229` `self.get("kero.seriko.alignmenttodesktop")`
