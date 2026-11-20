# sakura.seriko.defaultsurface,数値

- **規格**: [sakura.seriko.defaultsurface.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/sakura.seriko.defaultsurface.md)
- **検索語**: sakura.seriko.defaultsurface
- **対応状況**: ⚠️ 一部対応

## 突合結果

`crates/nanai-core/src/descript_parser/types.rs` の `sakura_default_surface()` において `sakura.seriko.defaultsurface` および `sakura.defaultsurface` のパースおよび取得が完全実装済み。

## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs:206` `/// Sakura側デフォルトサーフィスID (`sakura.seriko.defaultsurface`)`
- `crates/nanai-core/src/descript_parser/types.rs:208` `self.get("sakura.seriko.defaultsurface")`
