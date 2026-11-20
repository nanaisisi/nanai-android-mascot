# balloon.defaultsurface,数値

- **規格**: [balloon.defaultsurface.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/balloon.defaultsurface.md)
- **検索語**: balloon.defaultsurface
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/directory/manifest/parser.rs` および `GhostInfo` モデルにおいて `balloon.defaultsurface` キーをパース・参照する実装が完全に行われている。

## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs:250` `/// [char*.seriko.defaultsurface,数値], [char*.balloon.defaultsurface,数値]: キャラクター別`
- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:82` `m.get("balloon.defaultsurface")`
- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:87` `m.get("sakura.balloon.defaultsurface")`
- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:92` `m.get("kero.balloon.defaultsurface")`
- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:96` `// [balloon.defaultsurface,数値], [sakura.balloon.defaultsurface,数値], [kero.balloo`
- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:99` `// char0.defaultx char0.defaulty char0.defaultleft char0.defaulttop char0.balloo`
