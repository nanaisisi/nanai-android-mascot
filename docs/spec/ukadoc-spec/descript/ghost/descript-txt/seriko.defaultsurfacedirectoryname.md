# seriko.defaultsurfacedirectoryname,ディレクトリ名

- **規格**: [seriko.defaultsurfacedirectoryname.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/seriko.defaultsurfacedirectoryname.md)
- **検索語**: seriko.defaultsurfacedirectoryname
- **対応状況**: ⚠️ 一部対応

## 突合結果

`crates/nanai-core/src/descript_parser/types.rs` の `default_surface_directory_name()` において `seriko.defaultsurfacedirectoryname` ディレクティブのパースおよび取得が完全実装済み。

## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs:232` `/// [seriko.defaultsurfacedirectoryname,ディレクトリ名]: デフォルトサーフィスディレクトリ名`
- `crates/nanai-core/src/descript_parser/types.rs:234` `self.get("seriko.defaultsurfacedirectoryname")`
