# kero.seriko.defaultsurface,数値

- **規格**: [kero.seriko.defaultsurface.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/kero.seriko.defaultsurface.md)
- **検索語**: kero.seriko.defaultsurface
- **対応状況**: ⚠️ 一部対応

## 突合結果

`crates/nanai-core/src/descript_parser/types.rs` の `kero_default_surface()` において `kero.seriko.defaultsurface` および `kero.defaultsurface` のパースおよび取得が完全実装済み。

## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs:213` `/// Kero側デフォルトサーフィスID (`kero.seriko.defaultsurface`)`
- `crates/nanai-core/src/descript_parser/types.rs:215` `self.get("kero.seriko.defaultsurface")`
