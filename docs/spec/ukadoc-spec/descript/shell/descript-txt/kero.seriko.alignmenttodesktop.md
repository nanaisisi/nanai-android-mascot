# kero.seriko.alignmenttodesktop,位置情報

- **規格**: [kero.seriko.alignmenttodesktop.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/kero.seriko.alignmenttodesktop/) (ukadoc-spec/descript/shell/descript-txt/kero.seriko.alignmenttodesktop.md)
- **検索語**: kero.seriko.alignmenttodesktop
- **対応状況**: ⚠️ 一部対応

## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs:220` `/// デスクトップ位置揃え設定 (`seriko.alignmenttodesktop`, `sakura.seriko.alignmenttodesktop`
- `src-tauri/src/ghost/scan/shell/seriko.rs:18` `/// Kero 側デスクトップ位置揃え (`kero.seriko.alignmenttodesktop`/`seriko.alignmenttodesk`
- `ui/ts/surface/shell-manifest.ts:739` `? "kero.seriko.alignmenttodesktop"`
- `crates/nanai-core/src/descript_parser/types.rs:224` `.or_else(|| self.get("kero.seriko.alignmenttodesktop"))`
- `src-tauri/src/ghost/scan/shell/seriko.rs:76` `.get("kero.seriko.alignmenttodesktop")`
- `crates/nanai-core/src/descript_parser/types.rs:227` `/// Kero側デスクトップ位置揃え設定 (`kero.seriko.alignmenttodesktop`)`
