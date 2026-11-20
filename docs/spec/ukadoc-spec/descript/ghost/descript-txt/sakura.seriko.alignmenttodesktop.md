# sakura.seriko.alignmenttodesktop,位置情報

- **規格**: [sakura.seriko.alignmenttodesktop.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/sakura.seriko.alignmenttodesktop.md)
- **検索語**: sakura.seriko.alignmenttodesktop
- **対応状況**: ⚠️ 一部対応

## 突合結果

`crates/nanai-core/src/descript_parser/types.rs` の `alignment_to_desktop()` において `sakura.seriko.alignmenttodesktop` ディレクティブのパースおよび取得が完全実装済み。

## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs:220` `/// デスクトップ位置揃え設定 (`seriko.alignmenttodesktop`, `sakura.seriko.alignmenttodesktop`
- `crates/nanai-core/src/descript_parser/types.rs:223` `.or_else(|| self.get("sakura.seriko.alignmenttodesktop"))`
