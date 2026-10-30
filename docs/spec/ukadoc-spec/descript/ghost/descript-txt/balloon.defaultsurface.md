# balloon.defaultsurface,数値

- **規格**: [balloon.defaultsurface.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/balloon.defaultsurface.md)
- **検索語**: balloon.defaultsurface
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `balloon.defaultsurface` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:149` `// [sakura.balloon.defaultsurface,数値], [kero.balloon.defaultsurface,数値], [balloo`
- `src-tauri/src/ghost/scan/directory.rs:150` `let _sakura_bs = m.get("sakura.balloon.defaultsurface");`
- `src-tauri/src/ghost/scan/directory.rs:151` `let _kero_bs = m.get("kero.balloon.defaultsurface");`
- `src-tauri/src/ghost/scan/directory.rs:152` `let _balloon_bs = m.get("balloon.defaultsurface");`
- `src-tauri/src/ghost/scan/directory.rs:153` `let _char_bs = m.get("char0.balloon.defaultsurface");`
