# seriko.alignmenttodesktop,位置情報

- **規格**: [seriko.alignmenttodesktop.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/seriko.alignmenttodesktop/) (ukadoc-spec/descript/shell/descript-txt/seriko.alignmenttodesktop.md)
- **検索語**: seriko.alignmenttodesktop
- **対応状況**: ⚠️ 一部対応

実装コード内に「seriko.alignmenttodesktop」は検出されませんでした。


## 実装箇所

- `crates/nanai-core/src/descript_parser.rs:193` `/// デスクトップ位置揃え設定 (`seriko.alignmenttodesktop`)`
- `crates/nanai-core/src/descript_parser.rs:195` `self.get("seriko.alignmenttodesktop")`
- `crates/nanai-core/src/descript_parser.rs:196` `.or_else(|| self.get("sakura.seriko.alignmenttodesktop"))`
