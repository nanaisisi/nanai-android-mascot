# sakura.balloon.defaultsurface,数値

- **規格**: [sakura.balloon.defaultsurface.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/sakura.balloon.defaultsurface.md)
- **検索語**: sakura.balloon.defaultsurface
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/directory/manifest/parser.rs` および `GhostInfo` モデルにおいて `sakura.balloon.defaultsurface` キーをパース・参照する実装が完全に行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:87` `m.get("sakura.balloon.defaultsurface")`
- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:96` `// [balloon.defaultsurface,数値], [sakura.balloon.defaultsurface,数値], [kero.balloo`
