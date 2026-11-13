# sakura.seriko.defaultsurface,数値

- **規格**: [sakura.seriko.defaultsurface.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/sakura.seriko.defaultsurface.md)
- **検索語**: sakura.seriko.defaultsurface
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `sakura.seriko.defaultsurface` キーをパース・参照する実装が行われている。

## 実装箇所

- `crates/nanai-core/src/descript_parser.rs:179` `/// Sakura側デフォルトサーフィスID (`sakura.seriko.defaultsurface`)`
- `crates/nanai-core/src/descript_parser.rs:181` `self.get("sakura.seriko.defaultsurface")`
